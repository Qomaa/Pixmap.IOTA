"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IOTA = require("iota.lib.js");
var azure = require("azure-storage");
var iota;
var blobSvc = azure.createBlobService();
var pixmap;
initialize("https://nodes.iota.cafe", 443);
while (true) {
    setTimeout(function () {
        loadPixmap(function startProcess(error) {
            if (error) {
                console.error(error);
                return;
            }
            processAddress("QZZFKBIQNIBFNZBEU9DLGKHRMOWWGRDAYBKFAXSBWMDXEEAWIRUDDOVSEEFJ9ECH9VWJAFKLHSFAYUHJCEVZALQHQX");
        });
    }, 60000);
}
function initialize(nodeHost, nodePort) {
    iota = new IOTA({
        'host': nodeHost,
        'port': nodePort
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
// function sleep(ms): Promise<any> {
//     let f: Promise<any>;
//     //return new Promise(resolve => setTimeout(resolve, ms));
// }
// async function demo() {
//     console.log('Taking a break...');
//     await sleep(2000);
//     console.log('Two second later');
// } 
//# sourceMappingURL=app.js.map