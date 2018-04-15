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
