"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBagde = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const message_1 = require("../services/message");
const query_1 = require("../services/query");
const searchBagde = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    console.log('variables', variables);
    if (!variables.body.badge) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(17), data: (0, message_1.message)(33) });
    }
    const resultQuery = await (0, query_1.selectQuery)(16, variables.body);
    if (resultQuery.message !== (0, message_1.message)(17)) {
        await (0, cookieGenerator_1.cookieGenerator)(res, resultQuery.data[0]);
    }
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: resultQuery.data });
};
exports.searchBagde = searchBagde;
//# sourceMappingURL=searchBadge.js.map