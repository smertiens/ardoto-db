interface QueryConditions {
    fieldname: string,
    op: string,
    value: string|[]
}

export class Query {
    private sortBy: string;
    private sortOrder: string;
    private filters: string;
    private maxDocuments: number;
    private offset: number;
    private conditions: QueryConditions[];
    private tableName: string;
    private varsToBind: object;

    constructor(tableName: string) {
        this.tableName = tableName;
        this.varsToBind = {};
    }

    public static create(tableName: string): Query {
        return new Query(tableName);
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

    public all(): object[] {
        this.buildSQL();
        return [];
    }

    public first(): object {
        this.limit(1, 0);
        this.buildSQL();
        return {};
    }

    private addToBindList(param: any): string {
        const k = '@v' + Object.keys(this.varsToBind).length;
        this.varsToBind[k] = param;
        return k;
    }

    private buildSQL(): string {
        let sql = `SELECT * FROM ${this.tableName} `;

        if (this.conditions.length > 0) {
            sql += this.resolveConditionsToSQL();
        } 

        return sql;
    }

    private resolvePredicate(pred: object): string {
        let op = '=';
        let fieldname = Object.keys(pred)[0];
        let value = pred[fieldname];
        
        if ('@__op' in value) {
            op = value['@__op'];
            value = value['value'];
        } 

        const paramKey = this.addToBindList(value);
        return `${fieldname} ${op} ${paramKey}`;
    }

    private resolveConditionsToSQL(): string {
        for (const cond of this.conditions) {
            
        }

        return '';
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