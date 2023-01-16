"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPost = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const stopPost = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [(0, message_1.message)(20)]);
    const end = new Date().getTime() || 0;
    const timeSpend = Number(end - resultVerifyCodeNote.time) || 0;
    variables.cookies.goodFeed = null;
    variables.cookies.badFeed = null;
    variables.cookies.pointedCode = [7];
    variables.cookies.missingFeed = null;
    variables.cookies.reworkFeed = null;
    variables.cookies.pointedCodeDescription = ['Parada'];
    variables.cookies.motives = null;
    variables.cookies.tempoDecorrido = timeSpend;
    if (resultVerifyCodeNote.accepted) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(19), data: (0, message_1.message)(33) });
    }
    else {
        const resour = await (0, insert_1.insertInto)(variables.cookies);
        if (resour) {
            return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33) });
        }
        else if (!resour) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
        }
    }
};
exports.stopPost = stopPost;
//# sourceMappingURL=stopPost.js.map