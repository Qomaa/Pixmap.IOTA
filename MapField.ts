class MapField {
    constructor(x: string, y: string, color: string, value: number, pixmap: Pixmap) {
        this.x = x;
        this.y = y;
        this.pixmap = pixmap;
        this.color = color;
        this.value = value;
    }

    pixmap: Pixmap;
    x: string;
    y: string;   
    color: string;
    value: number;
    messageRef: number;
    linkRef: number;
}
