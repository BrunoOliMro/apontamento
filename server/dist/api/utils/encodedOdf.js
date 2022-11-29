"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encoded = void 0;
const encoded = (numeroOdf) => {
    let encodedOdfString = Buffer.from(numeroOdf, 'utf-8').toString('hex');
    return encodedOdfString;
};
exports.encoded = encoded;
//# sourceMappingURL=encodedOdf.js.map