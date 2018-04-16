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
function fromTrytes(inputTrytes) {
    // If input length is odd, return null
    if (inputTrytes.length % 2)
        return null;
    var TRYTE_VALUES = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var outputString = "";
    for (var i = 0; i < inputTrytes.length; i += 2) {
        // get a trytes pair
        var trytes = inputTrytes[i] + inputTrytes[i + 1];
        var firstValue = TRYTE_VALUES.indexOf(trytes[0]);
        var secondValue = TRYTE_VALUES.indexOf(trytes[1]);
        var decimalValue = firstValue + secondValue * 27;
        var character = String.fromCharCode(decimalValue);
        outputString += character;
    }
    return outputString;
}
exports.fromTrytes = fromTrytes;
function trimEnd(value, trimChar) {
    while (value.charAt(value.length - 1) == trimChar) {
        value = value.substr(0, value.length - 1);
    }
    return value;
}
exports.trimEnd = trimEnd;
//# sourceMappingURL=util.js.map