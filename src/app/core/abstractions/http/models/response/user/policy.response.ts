export class Policy {
    constructor(public key: string, public value: string) { }

    static fromObject(obj: any): Policy {
        return new Policy(obj.key, obj.value);
    }
}