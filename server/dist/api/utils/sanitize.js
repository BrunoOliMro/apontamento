"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = void 0;
const sanitize = (input) => {
    if (typeof (input) === 'object') {
        return input;
    }
    let message;
    if (!input || input === '0' || input === '00' || input === '000' || input === '0000' || input === '00000' || input === '000000' || input === '0000000' || input === '00000000') {
        return message = '';
    }
    const allowedChars = /[A-Za-z0-9' '.-]/;
    return input && input.split('').map((char) => (allowedChars.test(char) ? char : '')).join('');
};
exports.sanitize = sanitize;
//# sourceMappingURL=sanitize.js.map