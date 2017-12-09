class MapField {
    constructor(x: number, y: number, color: string, value: number, pixmap: Pixmap) {
        this.x = x;
        this.y = y;
        this.pixmap = pixmap;
        this.color = color;
        this.value = value;
    }

    pixmap: Pixmap;
    x: number;
    y: number;   
    color: string;
    value: number;
}
