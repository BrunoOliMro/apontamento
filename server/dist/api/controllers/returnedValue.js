"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnedValue = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const odfIndex_1 = require("../utils/odfIndex");
const update_1 = require("../services/update");
const query_1 = require("../services/query");
const returnedValue = async (req, res) => {
    const variables = await (0, variableInicializer_1.inicializer)(req);
    if (!variables.body.supervisor || !variables.body.quantity || !variables.body.barcodeReturn) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(48), data: (0, message_1.message)(33) });
    }
    const body = (0, unravelBarcode_1.unravelBarcode)(variables.body.barcodeReturn) || null;
    if (!body.data) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33) });
    }
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
        codeNoteResult = await (0, verifyCodeNote_1.verifyCodeNote)(body.data, [6, 8]);
        if (!codeNoteResult.accepted) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(25), data: (0, message_1.message)(33), code: codeNoteResult.code });
        }
    }
    const valorTotal = Number(goodFeed + badFeed);
    const groupOdf = await (0, query_1.selectQuery)(28, body.data);
    const i = await (0, odfIndex_1.odfIndex)(groupOdf.data, String(body.data.NUMERO_OPERACAO));
    const lastIndex = groupOdf.data.findIndex((element) => element.QTDE_APONTADA === 0) - 1;
    if (lastIndex !== i) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(43), data: (0, message_1.message)(33) });
    }
    let odf = groupOdf.data[i];
    if (i === groupOdf.data.length - 1) {
        odf = groupOdf.data[groupOdf.data.length - 1];
    }
    if (lastIndex === groupOdf.data.length - 1) {
        odf = groupOdf.data[groupOdf.data.length - 1];
    }
    if (goodFeed) {
        if (!odf.QTD_BOAS || odf.QTD_BOAS <= 0) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(27), data: (0, message_1.message)(33) });
        }
    }
    else if (badFeed) {
        if (!odf.QTD_REFUGO || odf.QTD_REFUGO <= 0) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(27), data: (0, message_1.message)(33) });
        }
    }
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
        const selectSuper = await (0, query_1.selectQuery)(10, variables.body);
        variables.cookies.QTDE_APONTADA = valorApontado;
        variables.cookies.NUMERO_ODF = body.data.NUMERO_ODF;
        variables.cookies.NUMERO_OPERACAO = body.data.NUMERO_OPERACAO;
        variables.cookies.CODIGO_MAQUINA = body.data.CODIGO_MAQUINA;
        variables.cookies.REVISAO = groupOdf.data[i].REVISAO;
        variables.cookies.QTDE_LIB = groupOdf.data[i].QTDE_LIB;
        variables.cookies.valorTotal = valorTotal;
        variables.cookies.valorApontado = groupOdf.data[i].QTDE_APONTADA - valorApontado;
        if (selectSuper.data.length > 0) {
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