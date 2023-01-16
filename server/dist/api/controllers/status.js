"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const status = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables.cookies) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(0) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [3, 4, 5, 7]);
    if (resultVerifyCodeNote.accepted) {
        const lookForTimer = await (0, query_1.selectQuery)(25, variables.cookies);
        console.log('lookForTimer', lookForTimer);
        let timeLeft;
        if (lookForTimer.data) {
            timeLeft = Number(lookForTimer.data[0].EXECUT * variables.cookies.QTDE_LIB * 1000 - (Number(new Date().getTime() - resultVerifyCodeNote.time))) || 0;
        }
        else {
            timeLeft = 6000;
        }
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: timeLeft });
    }
    else {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33) });
    }
};
exports.status = status;
//# sourceMappingURL=status.js.map