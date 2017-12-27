import IOTA = require('iota.lib.js');
import azure = require('azure-storage');

let iota: IOTA;
let blobSvc = azure.createBlobService();
let pixmap: Pixmap;

let host = process.env.IOTA_HOST;
let port = process.env.IOTA_PORT;
let provider = host + ":" + port;
let address = process.env.IOTA_ADDRESS; // //"CCUHXDMMHJMRYPRASPIEUHCAYMTUPCOPAFDZHXQZFROQMRYBUUGX9ZMPCJYJPJ9FICQVTZUIVFSKFUPLWJWDEACDAD";


console.log("provider: " + provider);
console.log("address: " + address);

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
        });

        await sleep(60000);
    }
}

function loadPixmap(callback: (error: Error) => void) {
    blobSvc.getBlobToText("pixmapcontainer", "pixmapblobtrytes", function (error, text, servRespone) {
        if (error) {
            callback(error);
            return;
        }

        pixmap = JSON.parse(text);
        //console.log(pixmap);
        callback(null);
    })
}

function processAddress(address: string) {
    let confirmedTransactions: any[];
    let transactionsHashes: string[];

    iota.api.findTransactionObjects({ "addresses": [address] }, function processTransactions(error: Error, transactions: any[]) {
        if (error) {
            console.error(error);
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

            confirmedTransactions.forEach(processConfirmedTransaction);
        })
    })
}

function processConfirmedTransaction(transaction) {
    let tag: string = transaction.tag as string;
    //tag = "99999U99IL9999999D9999999C";
    let trValue: number = transaction.value;
    //trValue = 99;
    let trX: string = tag.substring(0, 2);
    let trY: string = tag.substring(2, 4);
    let r: string = tag.substring(4, 6);
    let g: string = tag.substring(6, 8);
    let b: string = tag.substring(8, 10);
    let mes: number = trytesToNumber(tag.substring(10, 18));
    let link: number = trytesToNumber(tag.substring(18, 26));

    let rgbHex = "#" + pad(trytesToNumber(r).toString(16), 2, "0") +
        pad(trytesToNumber(g).toString(16), 2, "0") +
        pad(trytesToNumber(b).toString(16), 2, "0");

    if (!stringIsRGBHex(rgbHex)) return;

    let mapField: MapField;

    for (let i = 0; i < pixmap.mapFields.length; i++) {
        if (pixmap.mapFields[i].x == trX &&
            pixmap.mapFields[i].y == trY &&
            pixmap.mapFields[i].value < trValue) {
            pixmap.mapFields[i].color = rgbHex;
            pixmap.mapFields[i].value = trValue;
            pixmap.mapFields[i].messageRef = mes;
            pixmap.mapFields[i].linkRef = link;
            mapField = pixmap.mapFields[i];
            break;
        }
    }

    if (mapField == undefined) return;

    log("Changing field X:" + mapField.x + " Y:" + mapField.y + " (txhash:" + transaction.hash + ")");

    blobSvc.createBlockBlobFromText("pixmapcontainer", "pixmapblobtrytes", JSON.stringify(pixmap), function (error, result, servResponse) {
        if (error) {
            console.error(error);
            return;
        }
    });
}

function stringIsRGBHex(s: string) {
    return /^#[0-9A-F]{6}$/i.test(s);
}

function sleep(ms): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function numberToTrytes(input: number): string {
    const TRYTE_VALUES = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let trytes: string = "";
    let remainder: number;
    let quotient = input;

    let digit: string = "";

    while (quotient != 0) {

        remainder = quotient % 27;
        digit = TRYTE_VALUES.charAt(remainder);
        trytes = digit + trytes;
        quotient = Math.floor(quotient / 27);
    }

    return trytes;
}

function trytesToNumber(input: string): number {
    const TRYTE_VALUES = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result: number = 0;
    let position: number = 0;

    for (let i = input.length - 1; i >= 0; i--) {
        result += TRYTE_VALUES.indexOf(input[i]) * Math.pow(27, position);
        position++;
    }

    return result;
}

function pad(value: string, length: number, padchar: string) {
    return (value.toString().length < length) ? pad(padchar + value, length, padchar) : value;
}

function log(text: string) {
    console.log(new Date().toLocaleString() + ": " + text);
}