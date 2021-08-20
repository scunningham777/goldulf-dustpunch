export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;
export const GAME_SCALE = 3;
export const GAME_BG_COLOR = '#517339';
export const INVENTORY_REGISTRY_KEY = 'inventory';
export const DUST_PUNCH_EVENT_KEY = 'dustpunch';
export const STATIC_TEXTURE_KEY = 'static_images';
export const TERRAIN_TEXTURE_KEY = 'terrain';
export const EXIT_COLLISION_EVENT_KEY = 'exit_collision';
export const TOUCH_MOVEMENT_REGISTRY_KEY = 'touch_mvt_coords';
export const SHOW_MENU_REGISTRY_KEY = 'do_show_menu';
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
export const HERO_OFFSETS = {
    standing: {x: 4, y: 8},
    punching: {
        'UP': {x: 8, y: 1},
        'RIGHT': {x: 10, y: 2},
        'DOWN': {x: 0, y: 9},
        'LEFT': {x: -2, y: 2},
    }
}
export const STUFF_TINT = 0x79A1D2;
export const UI_SCENE_KEY = 'UIScene';
export const SITE_SCENE_KEY = 'site';
export const enum SITE_TYPES {
    overworld = 'overworld',
    site = 'site',
}

// "ENVIRONMENT"
export const IS_DEBUG = true;