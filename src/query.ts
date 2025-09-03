export class Query {
    private sortBy: string;
    private sortOrder: string;
    private filters: string;
    private maxDocuments: number;
    private offset: number;

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
}