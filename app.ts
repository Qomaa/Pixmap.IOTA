import IOTA = require('iota.lib.js');
import azure = require('azure-storage');

let iota: IOTA;
let blobSvc = azure.createBlobService();
let pixmap: Pixmap;

let host = process.env.IOTA_HOST;
let port = process.env.IOTA_PORT;
let address = process.env.IOTA_ADDRESS; // //"CCUHXDMMHJMRYPRASPIEUHCAYMTUPCOPAFDZHXQZFROQMRYBUUGX9ZMPCJYJPJ9FICQVTZUIVFSKFUPLWJWDEACDAD";

console.log(host);
console.log(port);
console.log(address);

start();

async function start() {
    iota = new IOTA({'host': host, 'port': port});

    while (true) {
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
    blobSvc.getBlobToText("pixmapcontainer", "pixmapblob", function (error, text, servRespone) {
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

        transactionsHashes = transactions.map(item => item.hash);

        iota.api.getLatestInclusion(transactionsHashes, function checkTransactions(error: Error, isConfirmed: any[]) {
            if (error) {
                console.error(error);
                return;
            }

            confirmedTransactions = transactions.filter((item, index) => {
                return isConfirmed[index] === true;
            });

            confirmedTransactions.forEach(processConfirmedTransaction);
        })
    })
}

function processConfirmedTransaction(transaction) {
    let tag: string = (transaction.tag as string).substring(0, 26); //letzen abschneiden, weil Konvertierung ins ASCII nur mit einer geraden Anzahl an Trytes funktioniert.
    // tag = "UAVAUAVAHAVAZAUAUAPBPB";
    let ascii: string = iota.utils.fromTrytes(tag);

    let trX: number = Number(ascii.substring(0, 2));
    let trY: number = Number(ascii.substring(2, 4));
    let rgbHex = ascii.substring(4, 11);
    let trValue: number = transaction.value;

    if (!stringIsRGBHex(rgbHex)) return;

    let mapField: MapField;

    for (let i = 0; i < pixmap.mapFields.length; i++) {
        if (pixmap.mapFields[i].x == trX &&
            pixmap.mapFields[i].y == trY &&
            pixmap.mapFields[i].value < trValue) {
            pixmap.mapFields[i].color = rgbHex;
            pixmap.mapFields[i].value = trValue;
            mapField = pixmap.mapFields[i];
            break;
        }
    }

    if (mapField == undefined) return;

    //console.log(pixmap);

    blobSvc.createBlockBlobFromText("pixmapcontainer", "pixmapblob", JSON.stringify(pixmap), function (error, result, servResponse) {
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
