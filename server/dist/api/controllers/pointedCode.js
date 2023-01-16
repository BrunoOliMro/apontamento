"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointedCode = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const message_1 = require("../services/message");
const pointedCode = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const pointedCode = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [4, 5]);
    console.log('pointedCode', pointedCode);
    if (pointedCode.accepted) {
        return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: pointedCode.code });
    }
    else {
        return res.status(400).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: pointedCode.code });
    }
};
exports.pointedCode = pointedCode;
//# sourceMappingURL=pointedCode.js.map