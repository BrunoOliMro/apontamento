"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopMotives = void 0;
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const stopMotives = async (_req, res) => {
    const result = await (0, query_1.selectQuery)(27);
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: result });
};
exports.stopMotives = stopMotives;
//# sourceMappingURL=stopMotives.js.map