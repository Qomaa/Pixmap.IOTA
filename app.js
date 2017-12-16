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
var azure = require("azure-storage");
var iota;
var blobSvc = azure.createBlobService();
var pixmap;
var host = process.env.IOTA_HOST;
var port = process.env.IOTA_PORT;
var address; //"CCUHXDMMHJMRYPRASPIEUHCAYMTUPCOPAFDZHXQZFROQMRYBUUGX9ZMPCJYJPJ9FICQVTZUIVFSKFUPLWJWDEACDAD";
blobSvc.getBlobToText("pixmapcontainer", "iotaReceiveAddress", function (error, text, servRespone) {
    if (error) {
        console.log(error);
    }
    ;
    address = text;
    start();
});
function start() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iota = new IOTA({ 'host': host, 'port': port });
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    loadPixmap(function startProcess(error) {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        processAddress(address);
                    });
                    return [4 /*yield*/, sleep(60000)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function loadPixmap(callback) {
    blobSvc.getBlobToText("pixmapcontainer", "pixmapblob", function (error, text, servRespone) {
        if (error) {
            callback(error);
            return;
        }
        pixmap = JSON.parse(text);
        //console.log(pixmap);
        callback(null);
    });
}
function processAddress(address) {
    var confirmedTransactions;
    var transactionsHashes;
    iota.api.findTransactionObjects({ "addresses": [address] }, function processTransactions(error, transactions) {
        if (error) {
            console.error(error);
            return;
        }
        transactionsHashes = transactions.map(function (item) { return item.hash; });
        iota.api.getLatestInclusion(transactionsHashes, function checkTransactions(error, isConfirmed) {
            if (error) {
                console.error(error);
                return;
            }
            confirmedTransactions = transactions.filter(function (item, index) {
                return isConfirmed[index] === true;
            });
            confirmedTransactions.forEach(processConfirmedTransaction);
        });
    });
}
function processConfirmedTransaction(transaction) {
    var tag = transaction.tag.substring(0, 26); //letzen abschneiden, weil Konvertierung ins ASCII nur mit einer geraden Anzahl an Trytes funktioniert.
    // tag = "UAVAUAVAHAVAZAUAUAPBPB";
    var ascii = iota.utils.fromTrytes(tag);
    var trX = Number(ascii.substring(0, 2));
    var trY = Number(ascii.substring(2, 4));
    var rgbHex = ascii.substring(4, 11);
    var trValue = transaction.value;
    if (!stringIsRGBHex(rgbHex))
        return;
    var mapField;
    for (var i = 0; i < pixmap.mapFields.length; i++) {
        if (pixmap.mapFields[i].x == trX &&
            pixmap.mapFields[i].y == trY &&
            pixmap.mapFields[i].value < trValue) {
            pixmap.mapFields[i].color = rgbHex;
            pixmap.mapFields[i].value = trValue;
            mapField = pixmap.mapFields[i];
            break;
        }
    }
    if (mapField == undefined)
        return;
    //console.log(pixmap);
    blobSvc.createBlockBlobFromText("pixmapcontainer", "pixmapblob", JSON.stringify(pixmap), function (error, result, servResponse) {
        if (error) {
            console.error(error);
            return;
        }
    });
}
function stringIsRGBHex(s) {
    return /^#[0-9A-F]{6}$/i.test(s);
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
//# sourceMappingURL=app.js.map