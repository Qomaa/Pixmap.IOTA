export function stringIsRGBHex(s: string) {
    return /^#[0-9A-F]{6}$/i.test(s);
}

export function sleep(ms): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function numberToTrytes(input: number): string {
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

export function trytesToNumber(input: string): number {
    const TRYTE_VALUES = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result: number = 0;
    let position: number = 0;

    for (let i = input.length - 1; i >= 0; i--) {
        result += TRYTE_VALUES.indexOf(input[i]) * Math.pow(27, position);
        position++;
    }

    return result;
}

export function pad(value: string, length: number, padchar: string) {
    return (value.toString().length < length) ? pad(padchar + value, length, padchar) : value;
}

export function log(text: string) {
    console.log(new Date().toLocaleString() + ": " + text);
}

export function logError(error) {
    console.error(new Date().toLocaleString() + " : " + error);
}

export function fromTrytes(inputTrytes: string) {
    // If input length is odd, return null
    if (inputTrytes.length % 2) return null

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

export function trimEnd(value: string, trimChar: string) {    
    while (value.charAt(value.length -1) == trimChar) {
        value = value.substr(0, value.length - 1)    ;
    }

    return value;
}