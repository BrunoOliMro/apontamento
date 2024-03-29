"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieGenerator = void 0;
const message_1 = require("../services/message");
const encryptOdf_1 = require("./encryptOdf");
const cookieGenerator = async (res, object) => {
    if (!object) {
        return (0, message_1.message)(0);
    }
    for (const [key, value] of Object.entries(object)) {
        if (key === 'NUMERO_ODF') {
            res.cookie(`${key}`, (0, encryptOdf_1.encrypted)(String(value)));
        }
        else {
            res.cookie(`${key}`, (0, encryptOdf_1.encrypted)(String(value)), { httpOnly: true });
        }
    }
};
exports.cookieGenerator = cookieGenerator;
//# sourceMappingURL=cookieGenerator.js.map