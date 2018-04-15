import { MapField } from "./MapField";

export class Batch {
    constructor(clientID: string, tag: string, changedFields: MapField[]) {
        this.clientID = clientID;
        this.tag = tag;
        this.changedFields = changedFields;
    }

    clientID: string;
    tag: string;
    changedFields: MapField[];
}
