import IOTA = require('iota.lib.js');
import { log, sleep, trytesToNumber, pad, stringIsRGBHex, logError } from "./util";
import { readMap, readMessage, Message, writeMap } from './db';

let iota: IOTA;
let pixmap: Pixmap;

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

    while (true) {
        log("start run");

        loadPixmap(function startProcess(error) {
            if (error) {
                console.error(error);
                return;
            }
            processAddress(address);
            if (address2 != undefined && address2 != "") {
                processAddress(address2);
            }
        });

        await sleep(60000);
    }
}

function loadPixmap(callback: (error: Error) => void) {
    readMap(function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        pixmap = result;
        // console.log(result._id);
        callback(null);
    });
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

        transactionsHashes = transactions.map(item => item.hash);

        iota.api.getLatestInclusion(transactionsHashes, function checkTransactions(error: Error, isConfirmed: any[]) {
            if (error) {
                console.error(error);
                return;
            }

            confirmedTransactions = transactions.filter((item, index) => {
                return isConfirmed[index] === true;
            });

            log("Confirmed transactions count: " + confirmedTransactions.length);

            //processConfirmedTransaction("");
            confirmedTransactions.forEach(processConfirmedTransaction);
        })
    })
}

function processConfirmedTransaction(transaction) {
    let tag: string = transaction.tag as string;
    //let tag = "999AEBILCX999999999999999B";
    let trValue: number = transaction.value;
    //let trValue = 11;
    let trX: string = tag.substring(0, 2);
    let trY: string = tag.substring(2, 4);
    let r: string = tag.substring(4, 6);
    let g: string = tag.substring(6, 8);
    let b: string = tag.substring(8, 10);
    let num: number = trytesToNumber(tag.substring(10, 26));
    let messageText: string;
    let link: string;
    let message: Message;

    let rgbHex = "#" + pad(trytesToNumber(r).toString(16), 2, "0") +
        pad(trytesToNumber(g).toString(16), 2, "0") +
        pad(trytesToNumber(b).toString(16), 2, "0");

    if (!stringIsRGBHex(rgbHex)) return;

    message = new Message(trX, trY, num, null, null);
    readMessage(message, function storeMessage(err, resultMessage, resultLink) {
        if (err) {
            logError(err);
            return;
        }

        let mapField: MapField;
        for (let i = 0; i < pixmap.mapFields.length; i++) {
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

        if (mapField == undefined) return;

        log("Changing field X:" + mapField.x + " Y:" + mapField.y + " message:" + mapField.message + + " link: " + mapField.link + " (txhash:" + transaction.hash + ")");

        writeMap(pixmap, function (err, result) {
            if (err) {
                logError(err);
            }
        });
    });
}