"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOdf = void 0;
const selectIfHasP_1 = require("../services/selectIfHasP");
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const clearCookie_1 = require("../utils/clearCookie");
const message_1 = require("../services/message");
const odfIndex_1 = require("../utils/odfIndex");
const select_1 = require("../services/select");
const update_1 = require("../services/update");
const searchOdf = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    const barcode = (0, unravelBarcode_1.unravelBarcode)(variables.body.barcode) || null;
    barcode.data.FUNCIONARIO = variables.cookies.FUNCIONARIO;
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    if (!barcode.data.NUMERO_ODF || !barcode.data.NUMERO_OPERACAO || !barcode.data.CODIGO_MAQUINA) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(6), data: (0, message_1.message)(6) });
    }
    else if (!barcode?.message) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(6), data: (0, message_1.message)(6) });
    }
    else if (!barcode.message) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(8), data: (0, message_1.message)(8) });
    }
    const odf = await (0, select_1.select)(0, barcode.data);
    if (!odf) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(6), data: (0, message_1.message)(8) });
    }
    const i = await (0, odfIndex_1.odfIndex)(odf, barcode.data.NUMERO_OPERACAO);
    if (odf.length <= 0) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(0) });
    }
    else if (!odf[i]) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(6), data: (0, message_1.message)(6) });
    }
    if (i <= 0) {
        odf[i].QTDE_LIB = odf[i].QTDE_ODF - odf[i].QTDE_APONTADA;
    }
    else if (i > 0) {
        odf[i].QTDE_LIB = (odf[i - 1].QTD_BOAS || 0) - (odf[i].QTD_BOAS || 0) - (odf[i].QTD_REFUGO || 0) - (odf[i].QTD_RETRABALHADA || 0);
    }
    if (!odf[i].QTDE_LIB || odf[i].QTDE_LIB <= 0) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(11), data: (0, message_1.message)(11) });
    }
    barcode.data.QTDE_LIB = odf[i].QTDE_LIB;
    barcode.data.CODIGO_PECA = odf[i].CODIGO_PECA;
    let resultComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(barcode);
    console.log('resultComponents', resultComponents);
    if (resultComponents.message === (0, message_1.message)(13) || resultComponents.message === (0, message_1.message)(14) || resultComponents.message === (0, message_1.message)(15)) {
        barcode.data.QTDE_LIB = resultComponents.quantidade < odf[i].QTDE_LIB ? resultComponents.quantidade : odf[i].QTDE_LIB;
        odf[i].condic = resultComponents.condic;
        odf[i].execut = resultComponents.execut;
        odf[i].childCode = resultComponents.childCode;
        barcode.data.QTDE_LIB = resultComponents.quantidade;
        console.log(' barcode.data.QTDE_LIB', barcode.data.QTDE_LIB);
        if (!barcode.data.QTDE_LIB) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(11), data: (0, message_1.message)(11) });
        }
        await (0, update_1.update)(1, barcode.data);
    }
    else if (resultComponents === (0, message_1.message)(12)) {
        await (0, clearCookie_1.cookieCleaner)(res);
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(11), data: (0, message_1.message)(11) });
    }
    else if (resultComponents === (0, message_1.message)(13)) {
        await (0, update_1.update)(1, barcode.data);
    }
    await (0, cookieGenerator_1.cookieGenerator)(res, odf[i]);
    const resultVerifyCodeNote = await (0, verifyCodeNote_1.verifyCodeNote)(barcode.data, [1, 3, 6, 9]);
    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(1), data: resultVerifyCodeNote.code });
};
exports.searchOdf = searchOdf;
//# sourceMappingURL=searchOdf.js.map