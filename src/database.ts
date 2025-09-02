import Database from 'better-sqlite3';
import { FileStorageProvider } from './storage.js';
import { ArdotoDBOptions } from './config.js';

class ArdotoDB {
    private sqliteconn: Database;
    private storage: FileStorageProvider;
    private options: ArdotoDBOptions;

    private dbname: string;
    private dbpath: string;

    constructor(dbname: string, dbpath: string, options: ArdotoDBOptions = {}) {
        this.sqliteconn = new Database();
        this.sqliteconn.pragma('journal_mode = WAL');
        
        this.options = {
            ... options,
            ... {}          // default options
        }
    }
}