export interface TouchEnabledWithEntity {
    touchStartX: number;
    touchStartY: number;
    touchMoveThreshold: number;
    entity: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform & {width: number, height: number};
}