import { ArdotoDB } from "./database.js";
import { DocumentIdFactory } from "./factories.js";
import { CollectionRowResult } from "./types.js";

export class Collection {
    private dbinst: ArdotoDB;
    private name: string;

    constructor(dbInst: ArdotoDB, name: string) {

        this.dbinst = dbInst;
        this.name = name;
        this.ensureCollectionInDB();
    }

    private ensureCollectionInDB(): void {
        const tables = this.dbinst.listTables();

        if (!tables.includes(`coll_${this.name}`)) {
            // create new table for this collection
            const stmt = this.dbinst.sqliteconn.prepare(`CREATE TABLE "coll_${this.name}" ("doc_id" TEXT NOT NULL UNIQUE, ` +
                    '"document"	JSON, PRIMARY KEY("doc_id"))');
            
            stmt.run();
            this.dbinst.tableCache.invalidate();
        }
    }

    public createDocument(data: object): string {
        let id: string;

        if ('id' in data) {
            id = "" + data.id;
        } else {
            id = DocumentIdFactory.makeId();
            data['id'] = id;
        }

        const j = JSON.stringify(data);
        const stmt = this.dbinst.sqliteconn.prepare(`INSERT INTO coll_${this.name} (doc_id, document) VALUES (?, ?)`);
        const r = stmt.run(id, j);
        
        if (r.changes === 1) {
            return id;
        } else {
            throw new Error('Error creating document.');
        }
    }

    public findById(id: string): object|null {
        const stmt = this.dbinst.sqliteconn.prepare(`SELECT * FROM coll_${this.name} WHERE doc_id = ?`);    
        const r = stmt.get(id) as CollectionRowResult;

        if (r === undefined) {
            return null;
        }

        return JSON.parse(r.document);
    }

    public all(): object[]|[] {
        const stmt = this.dbinst.sqliteconn.prepare(`SELECT * FROM coll_${this.name}`);    
        const r = stmt.all() as CollectionRowResult[];
        return r.map((row, idx) => {
            return JSON.parse(row.document);
        });
    }
}