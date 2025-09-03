import { v7 } from "uuid";
import { hash  } from 'node:crypto';

export class DocumentIdFactory {
    static makeId(): string {
        const rand = hash('sha1', v7().toString().replace(/\-/g, ''));
        return rand.substring(0, 16);
    }
}