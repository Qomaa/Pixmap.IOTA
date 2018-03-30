"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var connectionString = process.env.DB_CONNECTION_STRING;
var dbName = process.env.DB_NAME;
var mongoClient = mongo.MongoClient;
function query(collection, query, projection, sort, limit, callback) {
    mongoClient.connect(connectionString, function (err, db) {
        if (err) {
            callback(err, undefined);
            return;
        }
        var dbo = db.db(dbName);
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
function replace(collection, query, update, callback) {
    mongoClient.connect(connectionString, function (err, db) {
        if (err) {
            callback(err, undefined);
            return;
        }
        var dbo = db.db(dbName);
        dbo.collection(collection)
            .replaceOne(query, update, function (err, res) {
            db.close();
            callback(err, res);
        });
    });
}
function readMessage(message, callback) {
    var q = {
        x: message.x,
        y: message.y,
        num: message.num
    };
    var projection = { text: 1, link: 1 };
    query("message", q, projection, {}, 1, function (err, res) {
        var m = res;
        var found;
        found = (m != undefined);
        if (found) {
            callback(err, found, m.text, m.link);
        }
        else {
            callback(err, found, "", "");
        }
    });
}
exports.readMessage = readMessage;
function readMap(callback) {
    query("map", { _id: new ObjectID("5a92b5236e31ca1dfc82b83e") }, { id: 0 }, {}, 1, callback);
}
exports.readMap = readMap;
function writeMap(map, callback) {
    replace("map", {}, map, callback);
}
exports.writeMap = writeMap;
var Message = /** @class */ (function () {
    function Message(x, y, num, text, link) {
        this.x = x;
        this.y = y;
        this.num = num;
        this.text = text;
        this.link = link;
    }
    return Message;
}());
exports.Message = Message;
//# sourceMappingURL=db.js.map