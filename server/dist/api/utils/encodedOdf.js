"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodedOdfString = void 0;
const encodedOdfString = (numeroOdf) => {
    let encodedOdfString = Buffer.from(numeroOdf, 'utf-8').toString('hex');
    return encodedOdfString;
};
exports.encodedOdfString = encodedOdfString;
//# sourceMappingURL=encodedOdf.js.map