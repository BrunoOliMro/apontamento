"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supervisor = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const query_1 = require("../services/query");
const encryptOdf_1 = require("../utils/encryptOdf");
const message_1 = require("../services/message");
const supervisor = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33) });
    }
    const lookForBadge = await (0, query_1.selectQuery)(10, variables.body);
    if (lookForBadge.data[0]) {
        res.cookie('supervisor', (0, encryptOdf_1.encrypted)('verificado'), { httpOnly: true });
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: lookForBadge.data[0].CRACHA, supervisor: lookForBadge.data });
    }
    else {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33), supervisor: (0, message_1.message)(33) });
    }
};
exports.supervisor = supervisor;
//# sourceMappingURL=supervisor.js.map