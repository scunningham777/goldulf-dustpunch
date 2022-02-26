export interface ModalMenuConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    items: {
        text: string;
        onSelect: () => void;
    }[];
    showCursor: boolean;
}