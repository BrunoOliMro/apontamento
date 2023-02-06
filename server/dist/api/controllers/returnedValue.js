"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnedValue = void 0;
const variableInicializer_1 = require("../services/variableInicializer");
const verifyCodeNote_1 = require("../services/verifyCodeNote");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const global_config_1 = require("../../global.config");
const query_1 = require("../services/query");
const insert_1 = require("../services/insert");
const message_1 = require("../services/message");
const odfIndex_1 = require("../utils/odfIndex");
const update_1 = require("../services/update");
const mssql_1 = __importDefault(require("mssql"));
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
        variables.cookies.goodFeed = Number(!variables.body.valueStorage ? 0 : variables.body.quantity);
    }
    else if (variables.body.valueStorage === 'RUINS') {
        variables.cookies.badFeed = Number(!variables.body.valueStorage ? 0 : variables.body.quantity);
    }
    if (body.data) {
        codeNoteResult = await (0, verifyCodeNote_1.verifyCodeNote)(body.data, [6, 8]);
        if (!codeNoteResult.accepted) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(25), data: (0, message_1.message)(33), code: codeNoteResult.code });
        }
    }
    const valorTotal = Number(goodFeed + badFeed);
    const groupOdf = await (0, query_1.selectQuery)(28, body.data);
    const i = await (0, odfIndex_1.odfIndex)(groupOdf, String(body.data.NUMERO_OPERACAO));
    const lastIndex = groupOdf.findIndex((element) => element.QTDE_APONTADA === 0) - 1;
    if (lastIndex !== i) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(43), data: (0, message_1.message)(33), code: codeNoteResult.code });
    }
    let odf = groupOdf[i];
    if (i === groupOdf.length - 1) {
        odf = groupOdf[groupOdf.length - 1];
    }
    if (lastIndex === groupOdf.length - 1) {
        odf = groupOdf[groupOdf.length - 1];
    }
    if (goodFeed) {
        if (!odf.QTD_BOAS || odf.QTD_BOAS <= 0) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(27), data: (0, message_1.message)(33), code: codeNoteResult.code });
        }
    }
    else if (badFeed) {
        if (!odf.QTD_REFUGO || odf.QTD_REFUGO <= 0) {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(27), data: (0, message_1.message)(33), code: codeNoteResult.code });
        }
    }
    if (odf.QTDE_APONTADA < valorTotal || odf.QTDE_APONTADA <= 0 || !odf.QTD_REFUGO && badFeed > 0) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(27), data: (0, message_1.message)(33), code: codeNoteResult.code });
    }
    else if (!odf || '00' + odf.NUMERO_OPERACAO.replaceAll(' ', '0') !== body?.data.NUMERO_OPERACAO) {
        return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(29), data: (0, message_1.message)(33), code: codeNoteResult.code });
    }
    else {
        if (i <= 0) {
            odf.QTDE_LIB = odf.QTDE_ODF - odf.QTDE_APONTADA - odf.QTD_FALTANTE;
        }
        else if (i > 0) {
            odf.QTDE_LIB = (odf.QTD_BOAS || 0) - (odf.QTD_BOAS || 0) - (odf.QTD_REFUGO || 0) - (odf.QTD_RETRABALHADA || 0) - (odf.QTD_FALTANTE || 0);
        }
        const valorApontado = Number(odf.QTDE_APONTADA - valorTotal);
        variables.cookies.reworkFeed = null;
        variables.cookies.valorApontado = valorApontado;
        variables.cookies.missingFeed = null;
        variables.cookies.qtdLib = odf.QTDE_LIB;
        const selectSuper = await (0, query_1.selectQuery)(10, variables.body);
        variables.cookies.QTDE_APONTADA = valorApontado;
        variables.cookies.NUMERO_ODF = body.data.NUMERO_ODF;
        variables.cookies.NUMERO_OPERACAO = body.data.NUMERO_OPERACAO.replaceAll(' ', '').replaceAll('000', '');
        variables.cookies.CODIGO_MAQUINA = body.data.CODIGO_MAQUINA;
        variables.cookies.REVISAO = groupOdf[i].REVISAO;
        variables.cookies.QTDE_LIB = groupOdf[i].QTDE_LIB;
        variables.cookies.valorTotal = valorTotal;
        variables.cookies.valorApontado = groupOdf[i].QTDE_APONTADA - valorApontado;
        if (selectSuper.length > 0) {
            const resultHasP = await (0, query_1.selectQuery)(22, body.data);
            const execut = resultHasP.map((element) => element.EXECUT);
            const codigoFilho = resultHasP.map((item) => item.NUMITE);
            const processItens = resultHasP.map((item) => item.NUMSEQ).filter((element) => element === String(String(body.data['NUMERO_OPERACAO']).replaceAll(' ', '')).replaceAll('000', ''));
            if (processItens.length > 0) {
                const updateStorageQuery = [];
                codigoFilho.forEach((element, i) => {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${variables.body.quantity * execut[i]} WHERE 1 = 1 AND CODIGO = '${element}'`);
                });
                const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
                await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected);
            }
            const insertHisCodReturned = await (0, insert_1.insertInto)(variables.cookies);
            if (insertHisCodReturned) {
                const updateValuesOnPcp = await (0, update_1.update)(2, variables.cookies);
                if (updateValuesOnPcp === (0, message_1.message)(1)) {
                    return res.status(200).json({ status: (0, message_1.message)(1), message: (0, message_1.message)(31), data: (0, message_1.message)(31), code: codeNoteResult.code });
                }
                else {
                    return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: codeNoteResult.code });
                }
            }
            else {
                return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: codeNoteResult.code });
            }
        }
        else {
            return res.json({ status: (0, message_1.message)(1), message: (0, message_1.message)(0), data: (0, message_1.message)(33), code: codeNoteResult.code });
        }
    }
};
exports.returnedValue = returnedValue;
//# sourceMappingURL=returnedValue.js.map