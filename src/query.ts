import { ArdotoDB } from "./database.js";

export interface QueryConditions {
    fieldname: string,
    op: string,
    value: string|[]
}

export class Query {
    private sortBy: string = '';
    private sortOrder: string = 'DESC';
    private maxDocuments: number = -1;
    private offset: number = 0;
    private conditions: QueryConditions[]|[] = [];
    private tableName: string;
    private varsToBind = {};
    private db: ArdotoDB;

    constructor(db: ArdotoDB, tableName: string) {
        this.tableName = tableName;
        this.db = db;
    }

    public static create(db: ArdotoDB, tableName: string): Query {
        return new Query(db, tableName);
    }

    public where(conditions: QueryConditions | QueryConditions[]): Query {
        if (!Array.isArray(conditions)) {
            conditions = [conditions as QueryConditions];
        }
        
        this.conditions = conditions;
        return this;
    }

    public sort(fieldname: string, order:string = 'asc'): Query {
        this.sortBy = fieldname;
        this.sortOrder = order;
        return this;
    }

    public limit(n: number, offset: number = 0): Query {
        this.maxDocuments = n;
        this.offset = offset;
        return this;
    }

    private processResults(res: object[] | []): object[] | [] {
        if (res.length === 0) {
            return res;
        }

        return res.map((res, idx) => {
            if(res.document) {
                return JSON.parse(res.document);
            } else {
                throw new Error('Unexpected result.');
            }
        })
    }

    public async  all(): Promise<object[]> {
        const sql = this.buildSQL();
        console.log(sql);
        
        const res = this.db.runQuery(sql, this.varsToBind);
        return this.processResults(res);
    }

    public async first(): Promise<object> {
        this.limit(1,0);
        const r = await this.all();
        return r.length == 0 ? null : r[0];
    }

    private addToBindList(param: any): string {
        const k = 'v' + Object.keys(this.varsToBind).length;
        this.varsToBind[k] = param;
        return '@' + k;
    }

    private buildSQL(): string {
        let sql = `SELECT * FROM ${this.tableName} `;

        if (this.conditions.length > 0) {
            sql += 'WHERE ' + this.resolveConditionsToSQL(this.conditions) + ' ';
        } 

        if (this.sortBy != '') {
            sql += `ORDER BY ${this.sortBy} ${this.sortOrder} `
        }

        if (this.maxDocuments > 0) {
            sql += `LIMIT ${this.offset}, ${this.maxDocuments} `
        }

        return sql.trimEnd();
    }

    private resolvePredicate(pred: object): string {
        let op = '=';
        let fieldname = Object.keys(pred)[0];
        let value = pred[fieldname];
        
        if (typeof value === 'object' && value !== null && 
            Object.keys(value).includes('@__op')) {
            op = value['@__op'];
            value = value['value'];
        } 

        const paramKey = this.addToBindList(value);
        return `json_extract(document, '$.${fieldname}') ${op} ${paramKey}`;
    }

    private resolveConditionsToSQL(conditions: QueryConditions[], concatOp = 'AND'): string {
        let resolvedConditions = [];

        for (const cond of conditions) {
            if (Object.keys(cond).includes('@__or')) {
                // TODO: last
                resolvedConditions.push(this.resolveConditionsToSQL(cond['@__or'], 'OR'));
            }  else if (Object.keys(cond).includes('@__and')){
                resolvedConditions.push(this.resolveConditionsToSQL(cond['@__and'], 'AND'));
            } else {
                resolvedConditions.push(this.resolvePredicate(cond));
            }
        }
        return '(' + resolvedConditions.join(` ${concatOp} `) + ')';
    }

}

export function and(conditions: QueryConditions[]): object {
    return {'@__and': conditions};
}

export function or(conditions: QueryConditions[]): object {
    return {'@__or': conditions};
}

export function notEqual(value: any): {} {
    return {'@__op': '!=', value: value};
}

export function gt(value: any): {} {
    return {'@__op': '>', value: value};
}

export function lt(value: any): {} {
    return {'@__op': '<', value: value};
}

export function gte(value: any): {} {
    return {'@__op': '>=', value: value};
}

export function lte(value: any): {} {
    return {'@__op': '=<', value: value};
}