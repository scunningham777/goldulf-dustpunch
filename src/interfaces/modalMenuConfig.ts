export interface ModalMenuConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    numColumns: number;
    items: {
        text: string;
        onSelect: () => void;
    }[];
    showCursor: boolean;
}