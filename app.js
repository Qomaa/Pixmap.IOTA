"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var IOTA = require("iota.lib.js");
var util_1 = require("./util");
var db_1 = require("./db");
var iota;
var pixmap;
var host = process.env.IOTA_HOST;
var port = process.env.IOTA_PORT;
var provider = host + ":" + port;
var address = process.env.IOTA_ADDRESS; // //"CCUHXDMMHJMRYPRASPIEUHCAYMTUPCOPAFDZHXQZFROQMRYBUUGX9ZMPCJYJPJ9FICQVTZUIVFSKFUPLWJWDEACDAD";
var address2 = process.env.IOTA_ADDRESS2;
console.log("provider: " + provider);
console.log("address: " + address);
console.log("address2: " + address2);
start();
function start() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iota = new IOTA({ 'provider': provider });
                    loadPixmap(function startProcess(error) {
                        if (error) {
                            util_1.logError(error);
                            return;
                        }
                    });
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 5];
                    if (!(pixmap == undefined)) return [3 /*break*/, 3];
                    return [4 /*yield*/, util_1.sleep(100)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3:
                    util_1.log("start run");
                    processAddress(address);
                    if (address2 != undefined && address2 != "") {
                        processAddress(address2);
                    }
                    return [4 /*yield*/, util_1.sleep(60000)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function loadPixmap(callback) {
    db_1.readMap(function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        pixmap = result;
        // console.log(result._id);
        callback(null);
    });
}
function processAddress(address) {
    var confirmedTransactions;
    var transactionsHashes;
    util_1.log("processing address: " + address);
    iota.api.findTransactionObjects({ "addresses": [address] }, function processTransactions(error, transactions) {
        if (error) {
            util_1.logError(error);
            return;
        }
        util_1.log("Transactions count: " + transactions.length);
        transactionsHashes = transactions.map(function (item) { return item.hash; });
        iota.api.getLatestInclusion(transactionsHashes, function checkTransactions(error, isConfirmed) {
            if (error) {
                console.error(error);
                return;
            }
            confirmedTransactions = transactions.filter(function (item, index) {
                return isConfirmed[index] === true;
            });
            util_1.log("Confirmed transactions count: " + confirmedTransactions.length);
            //processConfirmedTransaction("");
            confirmedTransactions.forEach(processConfirmedTransaction);
        });
    });
}
function processConfirmedTransaction(transaction) {
    var tag = transaction.tag;
    //let tag = "999AEBILCX999999999999999B";
    var trValue = transaction.value;
    //let trValue = 11;
    var trX = tag.substring(0, 2);
    var trY = tag.substring(2, 4);
    var r = tag.substring(4, 6);
    var g = tag.substring(6, 8);
    var b = tag.substring(8, 10);
    var num = util_1.trytesToNumber(tag.substring(10, 26));
    var messageText;
    var link;
    var message;
    var rgbHex = "#" + util_1.pad(util_1.trytesToNumber(r).toString(16), 2, "0") +
        util_1.pad(util_1.trytesToNumber(g).toString(16), 2, "0") +
        util_1.pad(util_1.trytesToNumber(b).toString(16), 2, "0");
    if (!util_1.stringIsRGBHex(rgbHex))
        return;
    message = new db_1.Message(trX, trY, num, null, null);
    db_1.readMessage(message, function storeMessage(err, found, resultMessage, resultLink) {
        if (err) {
            util_1.logError(err);
            return;
        }
        if (!found) {
            //log("Message not found: x:" + message.x + " y:" + message.y + " num:" + message.num);
            return;
        }
        var mapField;
        for (var i = 0; i < pixmap.mapFields.length; i++) {
            if (pixmap.mapFields[i].x == trX &&
                pixmap.mapFields[i].y == trY &&
                pixmap.mapFields[i].value < trValue) {
                pixmap.mapFields[i].color = rgbHex;
                pixmap.mapFields[i].value = trValue;
                pixmap.mapFields[i].message = resultMessage;
                pixmap.mapFields[i].link = resultLink;
                mapField = pixmap.mapFields[i];
                break;
            }
        }
        if (mapField == undefined)
            return;
        util_1.log("Changing field X:" + mapField.x + " Y:" + mapField.y + " message:" + mapField.message + +" link: " + mapField.link + " (txhash:" + transaction.hash + ")");
        db_1.writeMap(pixmap, function (err, result) {
            if (err) {
                util_1.logError(err);
            }
        });
    });
}
//# sourceMappingURL=app.js.map