"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badFeedMotives = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const badFeedMotives = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const pointedCode = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [3, 4, 5, 7]);
    if (pointedCode.accepted) {
        const resultMotives = await (0, query_1.selectQuery)(1);
        return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: resultMotives });
    }
    else {
        return res.status(400).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
};
exports.badFeedMotives = badFeedMotives;
//# sourceMappingURL=badFeedMotives.js.map