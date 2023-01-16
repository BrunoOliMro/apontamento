"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnMotives = void 0;
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const returnMotives = async (_req, res) => {
    const result = await (0, query_1.selectQuery)('Select', 13);
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: result });
};
exports.returnMotives = returnMotives;
//# sourceMappingURL=returnMotives.js.map