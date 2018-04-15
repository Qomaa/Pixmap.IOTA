export class Message {
    constructor(x: string, y: string, num: number, text: string, link: string) {
        this.x = x;
        this.y = y;
        this.num = num;
        this.text = text;
        this.link = link;
    }

    x: string;
    y: string;
    num: number;
    clientID: string;
    text: string;
    link: string;
}