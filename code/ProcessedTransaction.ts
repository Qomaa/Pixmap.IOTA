export class ProcessedTransaction {
    constructor(tag: string, hash: string) {
        this.tag = tag;
        this.hash = hash;
    }

    tag: string;
    hash: string;
}
