"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnedValue = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const odfIndex_1 = require("../utils/odfIndex");
const select_1 = require("../services/select");
const update_1 = require("../services/update");
const returnedValue = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    console.log('variables', variables.body);
    if (!variables) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
    const body = (0, unravelBarcode_1.unravelBarcode)(variables.body.barcodeReturn) || null;
    var goodFeed = 0;
    var badFeed = 0;
    var codeNoteResult;
    variables.cookies.goodFeed = variables.body.QTDE_LIB || null;
    variables.cookies.badFeed = null;
    variables.cookies.pointedCode = [8];
    variables.cookies.missingFeed = null;
    variables.cookies.reworkFeed = null;
    variables.cookies.pointedCodeDescription = ['Estorno'];
    variables.cookies.motives = null;
    variables.cookies.tempoDecorrido = null;
    if (!variables.body.valueStorage) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(26), data: (0, message_1.message)(33) });
    }
    if (variables.body.valueStorage === 'BOAS') {
        goodFeed = Number(!variables.body.valueStorage ? 0 : variables.body.quantity);
    }
    else if (variables.body.valueStorage === 'RUINS') {
        badFeed = Number(!variables.body.valueStorage ? 0 : variables.body.quantity);
    }
    if (body.data) {
        codeNoteResult = await (0, verifyCodeNote_1.verifyCodeNote)(variables.cookies, [6, 8]);
        if (!codeNoteResult.accepted) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(25), data: (0, message_1.message)(33), code: codeNoteResult.code });
        }
    }
    const valorTotal = Number(goodFeed + badFeed);
    const groupOdf = await (0, select_1.select)(28, variables.cookies);
    const i = await (0, odfIndex_1.odfIndex)(groupOdf, String(body.data.NUMERO_OPERACAO));
    const lastIndex = groupOdf.findIndex((element) => element.QTDE_APONTADA === 0) - 1;
    if (lastIndex !== i) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(43), data: (0, message_1.message)(33) });
    }
    let odf = groupOdf[i];
    if (i === groupOdf.length - 1) {
        odf = groupOdf[groupOdf.length - 1];
    }
    if (lastIndex === groupOdf.length - 1) {
        odf = groupOdf[groupOdf.length - 1];
    }
    console.log(' goood', goodFeed);
    console.log('bad', badFeed);
    console.log('valorTotal', valorTotal);
    console.log('odf.QTDE_APONTADA', odf.QTDE_APONTADA);
    console.log('odf.QTDE_LIB', odf.QTDE_LIB);
    console.log('odf.odf.QTD_REFUGO', odf.QTD_REFUGO);
    if (odf.QTDE_APONTADA < valorTotal || odf.QTDE_APONTADA <= 0 || !odf.QTD_REFUGO && badFeed > 0) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(27), data: (0, message_1.message)(33) });
    }
    else if (!odf || '00' + odf.NUMERO_OPERACAO.replaceAll(' ', '0') !== body?.data.NUMERO_OPERACAO) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(29), data: (0, message_1.message)(33) });
    }
    else {
        const valorApontado = Number(odf.QTDE_APONTADA - valorTotal);
        const faltante = Number(odf.QTD_FALTANTE || 0) + valorTotal;
        const qtdLib = Number(odf.QTDE_LIB + valorTotal);
        variables.cookies.reworkFeed = null;
        variables.cookies.valorApontado = valorApontado;
        variables.cookies.missingFeed = faltante;
        variables.cookies.qtdLib = qtdLib;
        const selectSuper = await (0, select_1.select)(10, variables.body);
        console.log('odf.QTD_FALTANTE', odf.QTD_FALTANTE);
        console.log('variables.cookies.missingFeed', variables.cookies.missingFeed);
        console.log('variables', variables.cookies.valorApontado);
        console.log(' variables.cookies.goodFeed', variables.cookies.goodFeed);
        console.log(' variables.cookies.faltante', variables.cookies.faltante);
        console.log(' variables.cookies.QTDE_LIB', variables.cookies.QTDE_LIB);
        console.log(' variables.cookies.badFeed', variables.cookies.badFeed);
        if (selectSuper.length > 0) {
            const insertHisCodReturned = await (0, insert_1.insertInto)(variables.cookies);
            if (insertHisCodReturned) {
                const updateValuesOnPcp = await (0, update_1.update)(2, variables.cookies);
                if (updateValuesOnPcp === (0, message_1.message)(1)) {
                    return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(31), data: (0, message_1.message)(31) });
                }
                else {
                    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
                }
            }
            else {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
        }
    }
};
exports.returnedValue = returnedValue;
//# sourceMappingURL=returnedValue.js.map