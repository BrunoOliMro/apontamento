"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = void 0;
const clearCookie_1 = require("../utils/clearCookie");
const clear = async (_req, res) => {
    const x = await (0, clearCookie_1.cookieCleaner)(res);
    if (x) {
        return res.json({ message: 'Success' });
    }
    else {
        return res.json({ message: '' });
    }
};
exports.clear = clear;
//# sourceMappingURL=clear.js.map