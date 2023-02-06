"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = void 0;
const message_1 = require("../services/message");
const sanitize = (input) => {
    if (typeof (input) === 'number') {
        console.log('input number', input);
        return input;
    }
    if (typeof (input) === 'object') {
        return input;
    }
    if (!input || input === '0' || input === '00' || input === '000' || input === '0000' || input === '00000' || input === '000000' || input === '0000000' || input === '00000000') {
        return (0, message_1.message)(33);
    }
    const allowedChars = /[A-Za-z0-9çÇ' '.-]/;
    return input && input.split('').map((char) => (allowedChars.test(char) ? char : '')).join('');
};
exports.sanitize = sanitize;
//# sourceMappingURL=sanitize.js.map