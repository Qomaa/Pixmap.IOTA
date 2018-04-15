"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongo = require("mongodb");
let ObjectID = require('mongodb').ObjectID;
let connectionString = process.env.DB_CONNECTION_STRING;
let dbName = process.env.DB_NAME;
let mongoClient = mongo.MongoClient;
let dbo;
function queryOne(collection, query, projection, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield dbo.collection(collection)
            .find(query, projection)
            .sort(sort)
            .limit(1)
            .next();
    });
}
function query(collection, query, projection, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield dbo.collection(collection)
            .find(query, projection)
            .sort(sort)
            .toArray();
    });
}
function update(collection, query, update) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield dbo.collection(collection)
            .updateOne(query, update);
    });
}
function insert(collection, toInsert) {
    return __awaiter(this, void 0, void 0, function* () {
        dbo.collection(collection).insert(toInsert);
    });
}
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        let db = yield mongoClient.connect(connectionString);
        dbo = db.db(dbName);
    });
}
exports.connectDB = connectDB;
function readMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        let q = {
            x: message.x,
            y: message.y,
            num: message.num
        };
        let p = { text: 1, link: 1 };
        let s = {};
        return yield queryOne("message", q, p, s);
    });
}
exports.readMessage = readMessage;
function readMap() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield queryOne("map", { _id: new ObjectID("5a92b5236e31ca1dfc82b83e") }, { id: 0 }, {});
    });
}
exports.readMap = readMap;
function updateMapField(mapFieldToUpdate) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return yield update("map", q, u);
    });
}
exports.updateMapField = updateMapField;
function readBatch(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        let q = { tag: tag };
        let p = { _id: 0 };
        let s = { _id: -1 };
        return yield queryOne("batch", q, p, s);
    });
}
exports.readBatch = readBatch;
;
function writeProcessedTransaction(transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield insert("processedTx", transaction);
        // insert("processedTx", transaction, (err, res) => {
        //     if (err) logError(err);
        //     callback(err, res);
        // });
    });
}
exports.writeProcessedTransaction = writeProcessedTransaction;
function readProcessedTransactions() {
    return __awaiter(this, void 0, void 0, function* () {
        let q = {};
        let p = {};
        let s = {};
        return yield query("processedTx", q, p, s);
    });
}
exports.readProcessedTransactions = readProcessedTransactions;
//# sourceMappingURL=db.js.map