export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;
export const GAME_SCALE = 4;
export const GAME_BG_COLOR = '#517339';
export const POINTS_REGISTRY_KEY = 'points';
export const DUNGEON_LAYER_KEYS = {
    BG_LAYER: 'bg-layer',
    STUFF_LAYER: 'stuff-layer',
    DUST_LAYER: 'dust-layer',
};
export const HERO_ANIM_FRAME_RATE = 6;
export const HERO_FRAMES = {
    standing: {
        'UP': 1,
        'RIGHT': 5,
        'DOWN': 9,
        'LEFT': 5,
    },
    animStart: {
        'UP': 0,
        'RIGHT': 4,
        'DOWN': 8,
        'LEFT': 4,
    },
    animEnd: {
        'UP': 2,
        'RIGHT': 6,
        'DOWN': 10,
        'LEFT': 6,
    },
    punch: {
        'UP': 3,
        'RIGHT': 7,
        'DOWN': 11,
        'LEFT': 7,
    }
};
export const HERO_TINT = 0xE2DB75;
export const UI_SCENE_KEY = 'UIScene';