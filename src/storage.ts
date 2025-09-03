export const MAGIC = 139;

export interface FileStorageProvider {
    saveFile(contents: Buffer, mime: string, originalName: string): Promise<string>;
    getFile(id: string): Promise<File>; 
}

export interface File {
    originalName: string,
    mime: string,
    contents: Buffer
}