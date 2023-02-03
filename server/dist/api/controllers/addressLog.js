"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressLog = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const addressLog = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    const barcode = await (0, unravelBarcode_1.unravelBarcode)(variables.body.barcode);
    if (!barcode.data) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const data = await (0, query_1.selectQuery)(31, barcode.data);
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: data });
};
exports.addressLog = addressLog;
//# sourceMappingURL=addressLog.js.map