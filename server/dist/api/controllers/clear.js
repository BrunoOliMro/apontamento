"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = void 0;
const message_1 = require("../services/message");
const clearCookie_1 = require("../utils/clearCookie");
const clear = async (_req, res) => {
    const resultCleaner = await (0, clearCookie_1.cookieCleaner)(res);
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: resultCleaner });
};
exports.clear = clear;
//# sourceMappingURL=clear.js.map