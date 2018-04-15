"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stringIsRGBHex(s) {
    return /^#[0-9A-F]{6}$/i.test(s);
}
exports.stringIsRGBHex = stringIsRGBHex;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function numberToTrytes(input) {
    const TRYTE_VALUES = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let trytes = "";
    let remainder;
    let quotient = input;
    let digit = "";
    while (quotient != 0) {
        remainder = quotient % 27;
        digit = TRYTE_VALUES.charAt(remainder);
        trytes = digit + trytes;
        quotient = Math.floor(quotient / 27);
    }
    return trytes;
}
exports.numberToTrytes = numberToTrytes;
function trytesToNumber(input) {
    const TRYTE_VALUES = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = 0;
    let position = 0;
    for (let i = input.length - 1; i >= 0; i--) {
        result += TRYTE_VALUES.indexOf(input[i]) * Math.pow(27, position);
        position++;
    }
    return result;
}
exports.trytesToNumber = trytesToNumber;
function pad(value, length, padchar) {
    return (value.toString().length < length) ? pad(padchar + value, length, padchar) : value;
}
exports.pad = pad;
function log(text) {
    console.log(new Date().toLocaleString() + ": " + text);
}
exports.log = log;
function logError(error) {
    console.error(new Date().toLocaleString() + " : " + error);
}
exports.logError = logError;
//# sourceMappingURL=util.js.map