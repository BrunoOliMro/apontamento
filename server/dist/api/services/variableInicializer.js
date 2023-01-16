"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inicializer = void 0;
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const inicializer = async (req) => {
    console.log('sanitize,', (0, sanitize_1.sanitize)(req.body.values));
    var response = {
        body: {},
        cookies: {},
    };
    if (Object.keys(req.body).length > 0) {
        for (const [key, value] of Object.entries(req.body.values)) {
            const sanitizedValue = !(0, sanitize_1.sanitize)(value) ? null : (0, sanitize_1.sanitize)(value);
            response.body[key] = sanitizedValue;
        }
    }
    if (Object.keys(req.cookies).length > 0) {
        for (const [key, value] of Object.entries(req.cookies)) {
            const sanitizedValue = !(0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(value)) ? null : (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(value));
            response.cookies[key] = sanitizedValue;
        }
    }
    return response;
};
exports.inicializer = inicializer;
//# sourceMappingURL=variableInicializer.js.map