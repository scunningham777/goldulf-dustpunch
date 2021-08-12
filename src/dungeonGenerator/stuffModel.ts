export class StuffModel {
    public id: string;

    constructor(
        public x: number,
        public y: number,
        public tileX: number,
        public tileY: number,
        public textureKey: string,
        public stuffConfigId: string,
        index: number,
    ){
        this.id = `${index}${new Date().getTime()}`;
    }
}