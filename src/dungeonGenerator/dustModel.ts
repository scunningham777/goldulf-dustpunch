export class DustModel {
    public id: string;

    constructor(
        public x: number,
        public y: number,
        public key: string,
        public frame: number,
        public associatedStuffId: string,
        index: number,
    ) {
        this.id = `${index}${new Date().getTime()}`;
    }
}