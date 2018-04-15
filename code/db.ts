import mongo = require('mongodb');
import { log, logError } from "./util";
import { Message } from "./Message";
import { Pixmap } from "./Pixmap";
import { MapField } from "./MapField";
import { Batch } from "./Batch";
import { ProcessedTransaction } from "./ProcessedTransaction";

let ObjectID = require('mongodb').ObjectID;
let connectionString = process.env.DB_CONNECTION_STRING;
let dbName = process.env.DB_NAME;
let mongoClient = mongo.MongoClient;
let dbo: mongo.Db;

async function queryOne(collection: string, query: any, projection: any, sort: any) {
    return await dbo.collection(collection)
        .find(query, projection)
        .sort(sort)
        .limit(1)
        .next();
}

async function query(collection: string, query: any, projection: any, sort: any) {
    return await dbo.collection(collection)
        .find(query, projection)
        .sort(sort)
        .toArray();
}

async function update(collection: string, query: any, update: any) {
    return await dbo.collection(collection)
        .updateOne(query, update);
}

async function insert(collection: string, toInsert: any) {
    dbo.collection(collection).insert(toInsert);
}

export async function connectDB() {
    let db = await mongoClient.connect(connectionString);
    dbo = db.db(dbName);
}

export async function readMessage(message: Message): Promise<Message> {
    let q = {
        x: message.x,
        y: message.y,
        num: message.num
    };
    let p = { text: 1, link: 1 };
    let s = {};

    return await queryOne("message", q, p, s);
}

export async function readMap(): Promise<Pixmap> {
    return await queryOne("map", { _id: new ObjectID("5a92b5236e31ca1dfc82b83e") }, { id: 0 }, {});
}

export async function updateMapField(mapFieldToUpdate: MapField) {
    let q = {
        "mapFields": { $elemMatch: { "x": mapFieldToUpdate.x, "y": mapFieldToUpdate.y } }
    };

    let u = {
        $set: {
            "mapFields.$.color": mapFieldToUpdate.color,
            "mapFields.$.value": mapFieldToUpdate.value,
            "mapFields.$.link": mapFieldToUpdate.link,
            "mapFields.$.message": mapFieldToUpdate.message,
            "mapFields.$.timestamp": mapFieldToUpdate.timestamp,
            "mapFields.$.transaction": mapFieldToUpdate.transaction
        }
    };
    return await update("map", q, u);
}

export async function readBatch(tag: string): Promise<Batch> {
    let q = { tag: tag }
    let p = { _id: 0 }
    let s = { _id: -1 };

    return await queryOne("batch", q, p, s);
};

export async function writeProcessedTransaction(transaction: ProcessedTransaction) {
    return await insert("processedTx", transaction);

    // insert("processedTx", transaction, (err, res) => {
    //     if (err) logError(err);
    //     callback(err, res);
    // });
}

export async function readProcessedTransactions(): Promise<ProcessedTransaction[]> {
    let q = {};
    let p = {};
    let s = {};

    return await query("processedTx", q, p, s);
}