"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rip = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const insert_1 = require("../services/insert");
const query_1 = require("../services/query");
const message_1 = require("../services/message");
const rip = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables.cookies) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(0), code: (0, message_1.message)(33) });
    }
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [4]);
    const oldTimer = new Date(resultVerifyCodeNote.time).getTime();
    const timeSpendStartRip = Number(new Date().getTime() - oldTimer) || null;
    variables.cookies.tempoDecorrido = timeSpendStartRip;
    variables.cookies.pointedCodeDescription = [`Rip Ini.`];
    variables.cookies.missingFeed = null;
    variables.cookies.pointedCode = [5];
    variables.cookies.reworkFeed = null;
    variables.cookies.goodFeed = null;
    variables.cookies.badFeed = null;
    variables.cookies.motives = null;
    const ripDetails = await (0, query_1.selectQuery)(14, variables.cookies);
    if (ripDetails.data.length > 0) {
        res.cookie('cstNumope', ripDetails.data.map((acc) => acc.CST_NUMOPE));
        res.cookie('numCar', ripDetails.data.map((acc) => acc.NUMCAR));
        res.cookie('descricao', ripDetails.data.map((acc) => acc.DESCRICAO));
        res.cookie('especif', ripDetails.data.map((acc) => acc.ESPECIF));
        res.cookie('instrumento', ripDetails.data.map((acc) => acc.INSTRUMENTO));
        res.cookie('lie', ripDetails.data.map((acc) => acc.LIE));
        res.cookie('lse', ripDetails.data.map((acc) => acc.LSE));
    }
    if (resultVerifyCodeNote.accepted) {
        const insertedPointCode = await (0, insert_1.insertInto)(variables.cookies);
        const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [5]);
        if (!insertedPointCode) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(33), data: (0, message_1.message)(33), code: (0, message_1.message)(33) });
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: ripDetails.data, code: resultVerifyCodeNote.code });
        }
    }
    else {
        const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [5]);
        if (resultVerifyCodeNote.accepted) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: ripDetails.data, code: resultVerifyCodeNote.code });
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: (0, message_1.message)(33), code: resultVerifyCodeNote.code });
        }
    }
};
exports.rip = rip;
//# sourceMappingURL=rip.js.map