import IOTA = require('iota.lib.js');
import { log, sleep, trytesToNumber, fromTrytes, trimEnd, pad, stringIsRGBHex, logError } from "./code/util";
import { readMap, readMessage, updateMapField, writeProcessedTransaction, readProcessedTransactions, readBatch, connectDB } from './code/db';
import { Pixmap } from "./code/Pixmap";
import { ProcessedTransaction } from "./code/ProcessedTransaction";
import { Batch } from "./code/Batch";
import { MapField } from "./code/MapField";
import { Message } from "./code/Message";

let iota: IOTA;
let pixmap: Pixmap;
let processedTransactions: ProcessedTransaction[] = [];

let host = process.env.IOTA_HOST;
let port = process.env.IOTA_PORT;
let provider = host + ":" + port;
let address = process.env.IOTA_ADDRESS; // //"CCUHXDMMHJMRYPRASPIEUHCAYMTUPCOPAFDZHXQZFROQMRYBUUGX9ZMPCJYJPJ9FICQVTZUIVFSKFUPLWJWDEACDAD";
let address2 = process.env.IOTA_ADDRESS2;

console.log("provider: " + provider);
console.log("address: " + address);
console.log("address2: " + address2);

start();

async function start() {
    iota = new IOTA({ 'provider': provider });

    await init();

    while (true) {
        log("start run");

        if (address != undefined && address != ""){
            processAddress(address);
        }
        if (address2 != undefined && address2 != "") {
            processAddress(address2);
        }

        await sleep(60000);
    }
}

async function init() {
    try {
        await connectDB();
        pixmap = await readMap();
        processedTransactions = await readProcessedTransactions();
    } catch (e) {
        logError(e);
    }
}

function processAddress(address: string) {
    let confirmedTransactions: any[];
    let transactionsHashes: string[];

    log("processing address: " + address)

    iota.api.findTransactionObjects({ "addresses": [address] }, function processTransactions(error: Error, transactions: any[]) {
        if (error) {
            logError(error);
            return;
        }

        log("Transactions count: " + transactions.length);

        if (processedTransactions != undefined) {
            transactions = transactions.filter(tx => {
                return processedTransactions.find(ptx => ptx.hash === tx.hash) === undefined;
            });
        }

        log("Processing " + transactions.length + " transactions...");

        transactionsHashes = transactions.map(item => item.hash);

        iota.api.getLatestInclusion(transactionsHashes, function checkTransactions(error: Error, isConfirmed: any[]) {
            if (error) {
                console.error(error);
                return;
            }

            confirmedTransactions = transactions.filter((item, index) => isConfirmed[index]);

            log("New confirmed transactions: " + confirmedTransactions.length);

            // transactions[0].tag  = "ZZ99999999999999999999999CO";
            // processBatch(transactions[0]);

            confirmedTransactions.forEach(async tx => {
                try {
                    let tag: string = getTag(tx);

                    if (tag.startsWith("ZZ")) {
                        await processBatch(tx, tag);
                    } else {
                        await processSingleField(tx, tag);
                    }
                    addProcessedTransaction(tx);
                } catch (e) {
                    logError(e);
                }
            });
        });
    });
}

async function processBatch(transaction, tag: string) {
    tag = tag.toUpperCase();
    let trValue: number = transaction.value;
    //trValue = 999;
    // tag = "ZZ999999999999999999999999B";
    let minimumBatchValue: number = 0;
    let fieldToChange: MapField;
    let pixmapChanged: boolean = false;
    let batch: Batch;
    let fieldsToChange: MapField[] = [];
    let i: number = 0;

    log("Processing transaction tag/hash : " + tag + "/" + transaction.hash);

    batch = await readBatch(tag);
    if (batch === null) {
        log("No batch found.")
        addProcessedTransaction(transaction);
        return;
    }

    batch.changedFields.forEach(async batchField => {
        fieldToChange = pixmap.mapFields.find(originalField => originalField.x === batchField.x && originalField.y === batchField.y);
        if (fieldToChange === undefined) return;

        log(++i + ": Processing field (" + fieldToChange.x + "/" + fieldToChange.y + ")" + " Current value: " + fieldToChange.value + " NewValue: " + batchField.value + " Current txValue: " + trValue);

        //Prüfen, ob das zu ändernde Feld des Batches genug Wert hat.
        if (batchField.value < fieldToChange.value) {
            log("Batch-Field (" + batchField.x + "/" + batchField.y + ") doesn't have enough value. Has: " + batchField.value + " Required at least: " + fieldToChange.value + 1);
            return;
        }

        //Prüfen, ob die Transaktion genug Wert hat um Feld zu ändern.
        trValue = trValue - batchField.value;
        if (trValue < 0) {
            log("Transaction has not enough value to set all fields.");
            return;
        }

        //Die Transaktion hat (noch) für dieses Feld genug Wert, also ändern.
        fieldToChange.color = batchField.color;
        fieldToChange.link = batchField.link;
        fieldToChange.message = batchField.message
        fieldToChange.value = batchField.value;
        fieldToChange.transaction = transaction.hash;
        fieldToChange.timestamp = new Date().getTime().toString();

        log("Batch: Changing field X:" + fieldToChange.x + " Y:" + fieldToChange.y + " message:" + fieldToChange.message + " link: " + fieldToChange.link);
        await updateMapField(fieldToChange);
    });
}

async function processSingleField(transaction, tag) {
    tag = tag.toUpperCase();
    // tag = "9C999999999999999999999999";
    let trValue: number = transaction.value;
    // trValue = 2;
    let trX: string = tag.substring(0, 2);
    let trY: string = tag.substring(2, 4);
    let r: string = tag.substring(4, 6);
    let g: string = tag.substring(6, 8);
    let b: string = tag.substring(8, 10);
    let message: Message;
    let num: number = trytesToNumber(tag.substring(10, 26));
    let rgbHex = "#" + pad(trytesToNumber(r).toString(16), 2, "0") +
        pad(trytesToNumber(g).toString(16), 2, "0") +
        pad(trytesToNumber(b).toString(16), 2, "0");

    log("Processing transaction tag/hash : " + tag + "/" + transaction.hash);

    if (!stringIsRGBHex(rgbHex)) {
        log("Tag is not valid.");
        addProcessedTransaction(transaction);
        return;
    }

    message = await readMessage(new Message(trX, trY, num, null, null));
    if (message === null) {
        addProcessedTransaction(transaction);
        return;
    }

    pixmap.mapFields.forEach(async field => {
        if (field.x === trX &&
            field.y === trY &&
            field.value < trValue) {

            let newField = new MapField(trX, trY, rgbHex, trValue, null);
            newField.message = message.text;
            newField.link = message.link;
            newField.transaction = transaction.hash;
            newField.timestamp = new Date().getTime().toString();
            await updateMapField(newField);
            log("Changed field X:" + field.x + " Y:" + field.y + " message:" + message.text + " link: " + message.link + " (txhash: " + transaction.hash + ")");
        }
    });
}

async function addProcessedTransaction(transaction) {
    let ptx = new ProcessedTransaction(transaction.tag, transaction.hash);
    await writeProcessedTransaction(ptx);
    processedTransactions.push(ptx);
}

function getTag(transaction): string {
    let tag: string = transaction.signatureMessageFragment.substring(0, 56);
    if (tag !== "9".repeat(56)) {
        tag = trimEnd(fromTrytes(trimEnd(transaction.signatureMessageFragment, "9")), " ");
    } else {
        tag = transaction.tag;
    }

    return tag;
}