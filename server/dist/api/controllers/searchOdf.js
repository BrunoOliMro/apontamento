"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOdf = void 0;
const select_1 = require("../services/select");
const selectIfHasP_1 = require("../services/selectIfHasP");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const odfIndex_1 = require("../utils/odfIndex");
const update_1 = require("../services/update");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const sanitize_1 = require("../utils/sanitize");
const clearCookie_1 = require("../utils/clearCookie");
const codeNote_1 = require("../utils/codeNote");
const encodedOdf_1 = require("../utils/encodedOdf");
const searchOdf = async (req, res) => {
    const message = {
        barcodePointed: 'ODF apontada',
        barcodeNotFound: 'ODF não encontrada',
        barcodeInvalid: 'Código de barras inválido',
        barcodeEmpty: 'Código de barras está vazio',
        invalidEmployee: 'Funcionário inválido',
        generalError: 'Algo deu errado',
        noLimit: 'Não há limite na ODF',
        invalidQuantity: 'Quantidade para reserva inválida',
        noItensReserved: 'Não há item para reservar',
        valuesReserved: 'Valores Reservados',
        generateCookie: 'Gerar cookies',
    };
    const barcode = (0, unravelBarcode_1.unravelBarcode)(req.body.values) || null;
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS, QTD_REFUGO, QTD_FALTANTE, QTD_RETRABALHADA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${barcode.data.odfNumber} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    if (!barcode.data.odfNumber || !barcode.data.opNumber || !barcode.data.machineCod) {
        return res.json({ message: message.barcodeNotFound });
    }
    if (req.cookies['FUNCIONARIO']) {
        var employee = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        if (!employee) {
            return res.json({ message: message.invalidEmployee });
        }
    }
    else {
        return res.json({ message: message.generalError });
    }
    if (!barcode) {
        return res.json({ message: message.barcodeInvalid });
    }
    else if (!barcode.message) {
        return res.json({ message: message.barcodeEmpty });
    }
    const odf = await (0, select_1.select)(lookForOdfData);
    const i = await (0, odfIndex_1.odfIndex)(odf, barcode.data.opNumber);
    if (odf.length <= 0) {
        return res.json({ message: message.generalError });
    }
    else if (!odf[i]) {
        return res.json({ message: message.barcodeNotFound });
    }
    if (i <= 0) {
        if (odf[i].QTDE_APONTADA !== 0) {
            return res.json({ message: message.barcodePointed });
        }
        else {
            !odf[i].QTDE_APONTADA ? odf[i].QTDE_LIB = odf[i].QTDE_ODF : odf[i].QTDE_LIB = odf[i].QTDE_ODF - odf[i].QTDE_APONTADA;
        }
    }
    else if (i > 0) {
        if (odf[i].QTDE_APONTADA !== 0) {
            return res.json({ message: message.barcodePointed });
        }
        else {
            !odf[i].QTD_BOAS ? odf[i].QTD_BOAS = 0 : odf[i].QTD_BOAS;
        }
        let valuesPointed = odf[i - 1].QTDE_APONTADA - odf[i].QTDE_APONTADA;
        let diferenceBetweenGoodAndBad = odf[i - 1].QTD_BOAS - odf[i].QTD_BOAS;
        if (diferenceBetweenGoodAndBad <= 0 || valuesPointed <= 0) {
            return res.json({ message: message.noLimit });
        }
        if (odf[i].QTDE_APONTADA >= odf[i - 1].QTD_BOAS) {
            return res.json({ message: message.noLimit });
        }
        if (odf[i].QTDE_APONTADA > odf[i].QTD_BOAS) {
            odf[i].QTDE_LIB = odf[i - 1].QTD_BOAS - odf[i].QTDE_APONTADA;
        }
        else {
            odf[i].QTDE_LIB = diferenceBetweenGoodAndBad;
        }
    }
    else {
        return res.json({ message: message.noLimit });
    }
    if (!odf[i].QTDE_LIB || odf[i].QTDE_LIB <= 0) {
        return res.json({ message: message.noLimit });
    }
    let resultComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(barcode, odf[i].QTDE_LIB, employee, odf[i].NUMERO_OPERACAO, odf[i].CODIGO_PECA);
    if (resultComponents.message === message.valuesReserved || resultComponents.message === message.generateCookie) {
        if (resultComponents.quantidade < odf[i].QTDE_LIB) {
            odf[i].QTDE_LIB = resultComponents.quantidade;
        }
        odf[i].condic = resultComponents.condic;
        odf[i].execut = resultComponents.execut;
        odf[i].codigoFilho = resultComponents.codigoFilho;
        const queryUpdateQtdLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${barcode.data.odfNumber} AND NUMERO_OPERACAO = ${barcode.data.opNumber}`;
        await (0, update_1.update)(queryUpdateQtdLib);
    }
    else if (resultComponents === message.invalidQuantity) {
        await (0, clearCookie_1.cookieCleaner)(res);
        return res.json({ message: message.noLimit });
    }
    else if (resultComponents === message.noItensReserved) {
        const queryUpdateQtdeLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${barcode.data.odfNumber} AND NUMERO_OPERACAO = ${barcode.data.opNumber}`;
        await (0, update_1.update)(queryUpdateQtdeLib);
    }
    await (0, cookieGenerator_1.cookieGenerator)(res, odf[i]);
    res.cookie('encodedOdfNumber', (0, encodedOdf_1.encoded)(String(odf[i].NUMERO_ODF)), { httpOnly: true });
    res.cookie('encodedOperationNuber', (0, encodedOdf_1.encoded)(String(odf[i].NUMERO_OPERACAO)), { httpOnly: true });
    res.cookie('encodedMachineCode', (0, encodedOdf_1.encoded)(String(odf[i].CODIGO_MAQUINA)), { httpOnly: true });
    const pointed = await (0, codeNote_1.codeNote)(Number(barcode.data.odfNumber), Number(barcode.data.opNumber), barcode.data.machineCod, employee);
    console.log('SearchOdf -- linha 123 --', pointed);
    return res.json({ message: pointed.message });
};
exports.searchOdf = searchOdf;
//# sourceMappingURL=searchOdf.js.map