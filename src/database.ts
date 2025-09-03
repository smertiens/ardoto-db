import Database from 'better-sqlite3';
import { FileStorageProvider } from './storage.js';
import { ArdotoDBOptions } from './config.js';
import fs from 'node:fs';
import path from 'node:path';
import { Collection } from './collections.js';
import { MemoryCache, Cache } from './cache.js';
import { LocalFSStorage } from './localstorage.js';

export class ArdotoDB {
    sqliteconn: Database.Database;
    storage: FileStorageProvider;
    tableCache: Cache;

    private options: ArdotoDBOptions;

    private dbname: string;
    private dbpath: string;
    private dbfullpath: string;

    constructor(dbname: string, dbpath: string, options: ArdotoDBOptions = {}) {

        // init database
        this.dbpath = dbpath;
        this.dbname = dbname;
        this.checkDBPath();
        
        // Build options
        this.options = {
            ... {
                fileStorageEngine: 'local',
                metaStorageEngine: 'sqlite3'
            },
            ... options
        }

        // init sqlite3 db
        this.sqliteconn = new Database(path.join(this.dbfullpath, 'data.sqlite3'));
        this.sqliteconn.pragma('journal_mode = WAL');

        // init local storage
        this.storage = new LocalFSStorage(this.dbfullpath);

        // init caches
        this.tableCache = new MemoryCache();
    }

    public listTables(nocache = false): string[] {
        const cacheResult = this.tableCache.get('tables');

        if (nocache || cacheResult === null) {
            const stmt = this.sqliteconn.prepare("SELECT name FROM sqlite_master WHERE type='table'");
            const res = stmt.all();
            
            if (res) {
                const tables = res.map((k, idx) => {
                    return res[idx]['name'];
                });
                
                this.tableCache.set('tables', tables);
                return tables;
            }

            return [];
        } else {
            console.debug('Pulling tables from cache');
            return cacheResult;
        }
    }

    public collection(collectionName: string): Collection {
        return new Collection(this, collectionName);
    }

    private checkDBPath(): void {
        this.dbfullpath = path.resolve(path.join(this.dbpath, this.dbname));
        
        if (!fs.existsSync(this.dbfullpath)) {
            fs.mkdirSync(this.dbfullpath, {recursive: true});
        }
    }
}