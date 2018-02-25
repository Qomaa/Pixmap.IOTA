let mongo = require('mongodb');
let ObjectID = require('mongodb').ObjectID;
import { log, logError } from "./util";

let connectionString = process.env.DB_CONNECTION_STRING;
let dbName = process.env.DB_NAME;
let mongoClient = mongo.MongoClient;

function query(collection: string, query: any, projection: any, sort: any, limit: number, callback: (error: Error, result: any) => void) {
    mongoClient.connect(connectionString, function (err, db) {
        if (err) {
            callback(err, undefined);
            return;
        }

        let dbo = db.db(dbName);

        dbo.collection(collection)
            .find(query)
            .project(projection)
            .sort(sort)
            .limit(limit)
            .toArray(function (err, res) {
                db.close();
                callback(err, res[0]);
            });
    });
}

function replace(collection: string, query: any, update: any, callback: (error: Error, result: any) => void) {
    mongoClient.connect(connectionString, function (err, db) {
        if (err) {
            callback(err, undefined);
            return;
        }

        let dbo = db.db(dbName);

        dbo.collection(collection)
            .replaceOne(query, update, function (err, res) {
                db.close();
                callback(err, res);
            });
    });
}

export function readMessage(message: Message, callback: (error: Error, resultMessage: string, resultLink: string) => void) {
    let q = {
        x: message.x,
        y: message.y,
        num: message.num
    };

    let projection = { text: 1, link: 1 };

    query("message", q, projection, {}, 1, function (err, res) {
        let m: Message = res as Message;
        callback(err, m.text, m.link);
    });
}

export function readMap(callback: (error: Error, result: any) => void) {
    query("map", {_id: new ObjectID("5a92b5236e31ca1dfc82b83e")}, {id: 0 }, {}, 1, callback);
}

export function writeMap(map: any, callback: (error: Error, result: string) => void) {
    //let q = { _id: new ObjectID("5a92b5236e31ca1dfc82b83e") }; //mieser "workaround"/faulheit
    replace("map", {}, map, callback);
}

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