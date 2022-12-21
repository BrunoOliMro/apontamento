"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = void 0;
const clearCookie_1 = require("../utils/clearCookie");
const clear = async (_req, res) => {
    await (0, clearCookie_1.cookieCleaner)(res);
    return res.json({ message: 'Success' });
};
exports.clear = clear;
//# sourceMappingURL=clear.js.map