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
const IOTA = require("iota.lib.js");
const util_1 = require("./code/util");
const db_1 = require("./code/db");
const ProcessedTransaction_1 = require("./code/ProcessedTransaction");
const MapField_1 = require("./code/MapField");
const Message_1 = require("./code/Message");
let iota;
let pixmap;
let processedTransactions = [];
let host = process.env.IOTA_HOST;
let port = process.env.IOTA_PORT;
let provider = host + ":" + port;
let address = process.env.IOTA_ADDRESS; // //"CCUHXDMMHJMRYPRASPIEUHCAYMTUPCOPAFDZHXQZFROQMRYBUUGX9ZMPCJYJPJ9FICQVTZUIVFSKFUPLWJWDEACDAD";
let address2 = process.env.IOTA_ADDRESS2;
console.log("provider: " + provider);
console.log("address: " + address);
console.log("address2: " + address2);
start();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        iota = new IOTA({ 'provider': provider });
        yield init();
        while (true) {
            util_1.log("start run");
            processAddress(address);
            if (address2 != undefined && address2 != "") {
                processAddress(address2);
            }
            yield util_1.sleep(60000);
        }
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.connectDB();
            pixmap = yield db_1.readMap();
            processedTransactions = yield db_1.readProcessedTransactions();
        }
        catch (e) {
            util_1.logError(e);
        }
    });
}
function processAddress(address) {
    let confirmedTransactions;
    let transactionsHashes;
    util_1.log("processing address: " + address);
    iota.api.findTransactionObjects({ "addresses": [address] }, function processTransactions(error, transactions) {
        if (error) {
            util_1.logError(error);
            return;
        }
        util_1.log("Transactions count: " + transactions.length);
        if (processedTransactions != undefined) {
            transactions = transactions.filter(tx => {
                return processedTransactions.find(ptx => ptx.hash === tx.hash) === undefined;
            });
        }
        util_1.log("Processing " + transactions.length + " transactions...");
        transactionsHashes = transactions.map(item => item.hash);
        iota.api.getLatestInclusion(transactionsHashes, function checkTransactions(error, isConfirmed) {
            if (error) {
                console.error(error);
                return;
            }
            confirmedTransactions = transactions.filter((item, index) => isConfirmed[index]);
            util_1.log("New confirmed transactions: " + confirmedTransactions.length);
            // transactions[0].tag  = "ZZ99999999999999999999999CO";
            // processBatch(transactions[0]);
            confirmedTransactions.forEach((tx) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let tag = getTag(tx);
                    if (tag.startsWith("ZZ")) {
                        yield processBatch(tx, tag);
                    }
                    else {
                        yield processSingleField(tx, tag);
                    }
                    addProcessedTransaction(tx);
                }
                catch (e) {
                    util_1.logError(e);
                }
            }));
        });
    });
}
function processBatch(transaction, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        let trValue = transaction.value;
        //trValue = 999;
        // tag = "ZZ999999999999999999999999B";
        let minimumBatchValue = 0;
        let fieldToChange;
        let pixmapChanged = false;
        let batch;
        let fieldsToChange = [];
        let i = 0;
        util_1.log("Processing transaction tag/hash : " + tag + "/" + transaction.hash);
        batch = yield db_1.readBatch(tag);
        if (batch === null) {
            util_1.log("No batch found.");
            addProcessedTransaction(transaction);
            return;
        }
        batch.changedFields.forEach((batchField) => __awaiter(this, void 0, void 0, function* () {
            fieldToChange = pixmap.mapFields.find(originalField => originalField.x === batchField.x && originalField.y === batchField.y);
            if (fieldToChange === undefined)
                return;
            util_1.log(++i + ": Processing field (" + fieldToChange.x + "/" + fieldToChange.y + ")" + " Current value: " + fieldToChange.value + " NewValue: " + batchField.value + " Current txValue: " + trValue);
            //Prüfen, ob das zu ändernde Feld des Batches genug Wert hat.
            if (batchField.value < fieldToChange.value) {
                util_1.log("Batch-Field (" + batchField.x + "/" + batchField.y + ") doesn't have enough value. Has: " + batchField.value + " Required at least: " + fieldToChange.value + 1);
                return;
            }
            //Prüfen, ob die Transaktion genug Wert hat um Feld zu ändern.
            trValue = trValue - batchField.value;
            if (trValue < 0) {
                util_1.log("Transaction has not enough value to set all fields.");
                return;
            }
            //Die Transaktion hat (noch) für dieses Feld genug Wert, also ändern.
            fieldToChange.color = batchField.color;
            fieldToChange.link = batchField.link;
            fieldToChange.message = batchField.message;
            fieldToChange.value = batchField.value;
            fieldToChange.transaction = transaction.hash;
            fieldToChange.timestamp = new Date().getTime().toString();
            util_1.log("Batch: Changing field X:" + fieldToChange.x + " Y:" + fieldToChange.y + " message:" + fieldToChange.message + " link: " + fieldToChange.link);
            yield db_1.updateMapField(fieldToChange);
        }));
    });
}
function processSingleField(transaction, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        // tag = "9C999999999999999999999999";
        let trValue = transaction.value;
        // trValue = 2;
        let trX = tag.substring(0, 2);
        let trY = tag.substring(2, 4);
        let r = tag.substring(4, 6);
        let g = tag.substring(6, 8);
        let b = tag.substring(8, 10);
        let message;
        let num = util_1.trytesToNumber(tag.substring(10, 26));
        let rgbHex = "#" + util_1.pad(util_1.trytesToNumber(r).toString(16), 2, "0") +
            util_1.pad(util_1.trytesToNumber(g).toString(16), 2, "0") +
            util_1.pad(util_1.trytesToNumber(b).toString(16), 2, "0");
        util_1.log("Processing transaction tag/hash : " + tag + "/" + transaction.hash);
        if (!util_1.stringIsRGBHex(rgbHex)) {
            util_1.log("Tag is not valid.");
            addProcessedTransaction(transaction);
            return;
        }
        message = yield db_1.readMessage(new Message_1.Message(trX, trY, num, null, null));
        if (message === null) {
            addProcessedTransaction(transaction);
            return;
        }
        pixmap.mapFields.forEach((field) => __awaiter(this, void 0, void 0, function* () {
            if (field.x === trX &&
                field.y === trY &&
                field.value < trValue) {
                let newField = new MapField_1.MapField(trX, trY, rgbHex, trValue, null);
                newField.message = message.text;
                newField.link = message.link;
                newField.transaction = transaction.hash;
                newField.timestamp = new Date().getTime().toString();
                yield db_1.updateMapField(newField);
                util_1.log("Changed field X:" + field.x + " Y:" + field.y + " message:" + message.text + " link: " + message.link + " (txhash: " + transaction.hash + ")");
            }
        }));
    });
}
function addProcessedTransaction(transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let ptx = new ProcessedTransaction_1.ProcessedTransaction(transaction.tag, transaction.hash);
        yield db_1.writeProcessedTransaction(ptx);
        processedTransactions.push(ptx);
    });
}
function getTag(transaction) {
    let tag = transaction.signatureMessageFragment.substring(0, 56);
    if (tag !== "9".repeat(56)) {
        tag = util_1.trimEnd(util_1.fromTrytes(util_1.trimEnd(transaction.signatureMessageFragment, "9")), " ");
    }
    else {
        tag = transaction.tag;
    }
    return tag;
}
//# sourceMappingURL=app.js.map