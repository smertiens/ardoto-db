export interface Cache {
    set(name: string, o: any): void;
    get(name: string): any; 
    invalidate(): void;
}

export class MemoryCache implements Cache {
    private storage: {k: string, o: any}|{} = {};

    public set(name: string, o: any): void {
        this.storage[name] = o;
    }

    public get(name: string): any {
        return this.storage[name] ?? null;
    }

    public invalidate(): void {
        this.storage = {};
    }
}