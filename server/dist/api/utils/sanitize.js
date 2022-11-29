"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = void 0;
const sanitize = (input) => {
    const allowedChars = /[A-Za-z0-9' '.-]/;
    return input && input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
};
exports.sanitize = sanitize;
//# sourceMappingURL=sanitize.js.map