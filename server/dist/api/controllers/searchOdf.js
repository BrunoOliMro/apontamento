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
    const barcode = (0, unravelBarcode_1.unravelBarcode)(req.body.barcode) || null;
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, CODIGO_PECA, QTD_BOAS, QTD_REFUGO, QTD_FALTANTE, QTD_RETRABALHADA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${barcode.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    let employee;
    if (!barcode.numOdf || !barcode.numOper || !barcode.codMaq) {
        return res.json({ message: 'ODF não encontrada' });
    }
    if (req.cookies['FUNCIONARIO']) {
        employee = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    }
    else {
        return res.json({ message: 'Algo deu errado' });
    }
    if (barcode.message === 'Código de barras inválido' || !barcode) {
        return res.json({ message: 'Código de barras inválido' });
    }
    else if (barcode.message === 'Código de barras está vazio') {
        return res.json({ message: 'Código de barras está vazio' });
    }
    else if (!employee) {
        return res.json({ message: 'Funcionário inválido' });
    }
    const odf = await (0, select_1.select)(lookForOdfData);
    if (odf.length <= 0) {
        return res.json({ message: 'Algo deu errado' });
    }
    let i = await (0, odfIndex_1.odfIndex)(odf, barcode.numOper);
    if (!odf[i]) {
        console.log('nao existe essa odf/operacao/maquina');
        return res.json({ message: 'Essa ODF não foi encontrada' });
    }
    if (i <= 0) {
        if (odf[i].QTDE_APONTADA !== 0) {
            return res.json({ message: 'ODF já apontada' });
        }
        else {
            !odf[i].QTDE_APONTADA ? odf[i].QTDE_LIB = odf[i].QTDE_ODF : odf[i].QTDE_LIB = odf[i].QTDE_ODF - odf[i].QTDE_APONTADA;
        }
    }
    else if (i > 0) {
        if (odf[i].QTDE_APONTADA !== 0) {
            return res.json({ message: 'ODF já apontada' });
        }
        else {
            !odf[i].QTD_BOAS ? odf[i].QTD_BOAS = 0 : odf[i].QTD_BOAS;
        }
        let valuesPointed = odf[i - 1].QTDE_APONTADA - odf[i].QTDE_APONTADA;
        let diferenceBetweenGoodAndBad = odf[i - 1].QTD_BOAS - odf[i].QTD_BOAS;
        if (diferenceBetweenGoodAndBad <= 0 || valuesPointed <= 0) {
            return res.json({ message: 'Não há limite na ODF' });
        }
        if (odf[i].QTDE_APONTADA >= odf[i - 1].QTD_BOAS) {
            return res.json({ message: 'Não há limite na ODF' });
        }
        if (odf[i].QTDE_APONTADA > odf[i].QTD_BOAS) {
            odf[i].QTDE_LIB = odf[i - 1].QTD_BOAS - odf[i].QTDE_APONTADA;
        }
        else {
            odf[i].QTDE_LIB = diferenceBetweenGoodAndBad;
        }
    }
    else {
        return res.json({ message: 'Não há limite na ODF' });
    }
    if (!odf[i].QTDE_LIB || odf[i].QTDE_LIB <= 0) {
        return res.json({ message: 'Não há limite na ODF' });
    }
    let resultComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(barcode, odf[i].QTDE_LIB, employee, odf[i].NUMERO_OPERACAO, odf[i].CODIGO_PECA);
    console.log('resultComponents : ', resultComponents);
    if (resultComponents.message === 'Valores Reservados') {
        if (resultComponents.quantidade < odf[i].QTDE_LIB) {
            odf[i].QTDE_LIB = resultComponents.quantidade;
        }
        const queryUpdateQtdLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${barcode.numOdf} AND NUMERO_OPERACAO = ${barcode.numOper}`;
        await (0, update_1.update)(queryUpdateQtdLib);
    }
    else if (resultComponents === 'Quantidade para reserva inválida') {
        await (0, clearCookie_1.cookieCleaner)(res);
        return res.json({ message: 'Não há limite na ODF' });
    }
    else if (resultComponents === 'Não há item para reservar') {
        const queryUpdateQtdeLib = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${odf[i].QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${barcode.numOdf} AND NUMERO_OPERACAO = ${barcode.numOper}`;
        await (0, update_1.update)(queryUpdateQtdeLib);
    }
    odf[i].condic = resultComponents.condic;
    odf[i].execut = resultComponents.execut;
    odf[i].codigoFilho = resultComponents.codigoFilho;
    await (0, cookieGenerator_1.cookieGenerator)(res, odf[i]);
    res.cookie('encodedOdfNumber', (0, encodedOdf_1.encoded)(String(odf[i].NUMERO_ODF)), { httpOnly: true });
    res.cookie('encodedOperationNuber', (0, encodedOdf_1.encoded)(String(odf[i].NUMERO_OPERACAO)), { httpOnly: true });
    res.cookie('encodedMachineCode', (0, encodedOdf_1.encoded)(String(odf[i].CODIGO_MAQUINA)), { httpOnly: true });
    const pointCode = await (0, codeNote_1.codeNote)(barcode.numOdf, barcode.numOper, barcode.codMaq, employee);
    return res.json({ message: pointCode.message });
};
exports.searchOdf = searchOdf;
//# sourceMappingURL=searchOdf.js.map