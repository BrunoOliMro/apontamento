"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supervisor = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const message_1 = require("../services/message");
const select_1 = require("../services/select");
const encryptOdf_1 = require("../utils/encryptOdf");
const supervisor = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33) });
    }
    const lookForBadge = await (0, select_1.select)(10, variables.body);
    res.cookie('supervisor', (0, encryptOdf_1.encrypted)('verificado'), { httpOnly: true });
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: lookForBadge });
};
exports.supervisor = supervisor;
//# sourceMappingURL=supervisor.js.map