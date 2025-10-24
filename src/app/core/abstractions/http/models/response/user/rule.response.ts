export class Rule {
    constructor(public key: string, public value: string) { }

    static fromObject(obj: any): Rule {
        return new Rule(obj.key, obj.value);
    }
}