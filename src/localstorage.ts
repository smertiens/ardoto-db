import { DocumentIdFactory } from "./factories.js";
import { File, FileStorageProvider, MAGIC } from "./storage.js";
import fs from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';

export class LocalFSStorage implements FileStorageProvider {
    private rootFolder: string;

    constructor(rootFolder: string) {
        this.rootFolder = rootFolder;
    }

    public async saveFile(contents: Buffer, mime: string, originalName: string = ''): Promise<string> {
        const id = DocumentIdFactory.makeId();
        let pos = 0;

        const header = Buffer.from(JSON.stringify({mime: mime, name: originalName}), 'utf8');
        const buffer = Buffer.alloc(1 + 1 + 4 + header.length + contents.length);
        
        buffer.writeUint8(MAGIC);
        pos += 1;

        // this will limit header size ti 255 bytes
        buffer.writeUInt8(header.length, pos);
        pos += 1;

        header.copy(buffer, pos);
        pos += header.length;

        // this will limit file-size to around 4.29 GB
        buffer.writeUint32BE(contents.length, pos);
        pos += 4;

        header.copy(contents, pos);

        await fs.writeFile(path.join(this.rootFolder, id), buffer);
        return id;
    }

    async getFile(id: string): Promise<File> {
        //TODO: Make sure id is validated !!!
        let pos = 0;
        const buffer = await fs.readFile(path.join(this.rootFolder, id));
        const magicNumber = buffer.readUInt8();
        pos += 1;

        if (magicNumber !== MAGIC) {
            throw Error('The requested file is not an Ardoto db file.');
        }

        const headerLen = buffer.readUInt8(pos);
        pos += 1;

        const header = JSON.parse(buffer.toString('utf-8', pos, pos + headerLen));
        pos += headerLen;

        const contentLen = buffer.readUint32BE(pos);
        pos += 4;

        const buffContent = Buffer.from(buffer.subarray(pos, pos + contentLen))
    
        return {
            contents: buffContent,
            mime: header.mime,
            originalName: header.name
        };
    }
    
}