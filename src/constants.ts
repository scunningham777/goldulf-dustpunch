export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;
export const GAME_SCALE = 3;
export const GAME_BG_COLOR = 0x000066;
export const GAME_BG_COLOR_HEX_STRING = '#000066';
export const INVENTORY_STUFF_REGISTRY_KEY = 'inventory_stuff';
export const INVENTORY_STUFF_REGISTRY_KEY__OLD = 'inventory';
export const INVENTORY_TOKENS_REGISTRY_KEY = 'inventory_tokens';
export const SITE_DATA_REGISTRY_KEY = 'site_data';
export const DUST_PUNCH_EVENT_KEY = 'dustpunch';
export const STATIC_TEXTURE_KEY = 'static_images';
export const TERRAIN_TEXTURE_KEY = 'terrain';
export const UI_TEXTURE_KEY = 'ui_texture';
export const HERO_TEXTURE_KEY = 'hero_texture';
export const ANCESTORS_TEXTURE_KEY = 'ancestors_texture';
export const EXIT_COLLISION_EVENT_KEY = 'exit_collision';
export const TOUCH_MOVEMENT_REGISTRY_KEY = 'touch_mvt_coords';
export const SHOW_MENU_REGISTRY_KEY = 'do_show_menu';
export const HERO_VELOCITY = 250;
export const HERO_DEBUG_VELOCITY_MULTIPLIER = 1.5;
export const HERO_MOVEMENT_CONTROLLER_REGISTRY_KEY = 'hero_mvt_ctrl';
export const DUNGEON_LAYER_KEYS = {
    BG_LAYER: 'bg-layer',
    STUFF_LAYER: 'stuff-layer',
    DUST_LAYER: 'dust-layer',
};
export const HERO_ANIM_FRAME_RATES = {
    'walk': 4,
    'punch': 7,
};
export const HERO_FRAMES = {
    standing: {
        'UP': 2,
        'RIGHT': 7,
        'DOWN': 12,
        'LEFT': 7,
    },
    walkAnimStart: {
        'UP': 1,
        'RIGHT': 6,
        'DOWN': 11,
        'LEFT': 6,
    },
    walkAnimEnd: {
        'UP': 3,
        'RIGHT': 8,
        'DOWN': 13,
        'LEFT': 8,
    },
    punchAnimStart: {
        'UP': 0,
        'RIGHT': 5,
        'DOWN': 10,
        'LEFT': 5,
    },
    punchAnimEnd: {
        'UP': 4,
        'RIGHT': 9,
        'DOWN': 14,
        'LEFT': 9,
    }
};
export const HERO_TINT = 0x41f160;
export const HERO_OFFSETS = {
    standing: {x: 4, y: 8},
    punching: {
        'UP': {x: 8, y: 1},
        'RIGHT': {x: 10, y: 2},
        'DOWN': {x: 0, y: 9},
        'LEFT': {x: -2, y: 2},
    }
}
export const STUFF_TINT = 0xE2DB75;
export const UI_SCENE_KEY = 'UIScene';
export const SITE_COMPLETE_SCENE_KEY = 'SiteComplete';
export const SITE_SCENE_KEY = 'site';
export const enum SITE_TYPES {
    overworld = 'overworld',
    site = 'site',
}
export const TYPEWRITER_WORD_INTERVAL = 80;

// "ENVIRONMENT"
export const IS_DEBUG = false;
export const SKIP_OVERWORLD = false;
export const HERO_MOVEMENT_CONTROLLER: 'follow' | 'joystick' = 'joystick';