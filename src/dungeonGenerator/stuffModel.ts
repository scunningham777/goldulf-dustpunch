export class StuffModel {
    public id: string;

    constructor(
        public x: number,
        public y: number,
        public tileX: number,
        public tileY: number,
        public key: string,
        public frame: number,
        public points: number,
        index: number,
    ){
        this.id = `${index}${new Date().getTime()}`;
    }
}