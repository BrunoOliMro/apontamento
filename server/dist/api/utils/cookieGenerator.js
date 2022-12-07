"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieGenerator = void 0;
const encryptOdf_1 = require("./encryptOdf");
const cookieGenerator = async (res, object) => {
    for (const [key, value] of Object.entries(object)) {
        res.cookie(`${key}`, (0, encryptOdf_1.encrypted)(String(value)), { httpOnly: true });
    }
};
exports.cookieGenerator = cookieGenerator;
//# sourceMappingURL=cookieGenerator.js.map