"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOdf = void 0;
const select_1 = require("../services/select");
const selectIfHasP_1 = require("../services/selectIfHasP");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const odfIndex_1 = require("../utils/odfIndex");
const queryGroup_1 = require("../utils/queryGroup");
const update_1 = require("../services/update");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const sanitize_1 = require("../utils/sanitize");
const clearCookie_1 = require("../utils/clearCookie");
const codeNote_1 = require("../utils/codeNote");
const encodedOdf_1 = require("../utils/encodedOdf");
const searchOdf = async (req, res) => {
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.barcode) || null;
    console.log('dados', dados);
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const lookForOdfData = `SELECT REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB, QTD_REFUGO, CODIGO_PECA FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    if (dados.message === 'Código de barras inválido') {
        return res.json({ message: 'Código de barras inválido' });
    }
    else if (dados.message === 'Código de barras está vazio') {
        return res.json({ message: 'Código de barras está vazio' });
    }
    else if (!funcionario) {
        return res.json({ message: 'Funcionario inválido' });
    }
    const groupOdf = await (0, select_1.select)(lookForOdfData);
    console.log('linha 33 /group/', groupOdf);
    if (!groupOdf || groupOdf.length <= 0) {
        return res.json({ message: 'ODF não encontrada' });
    }
    let indexOdf = await (0, odfIndex_1.odfIndex)(groupOdf, dados.numOper);
    if (indexOdf === undefined || indexOdf === null) {
        return res.json({ message: 'Algo deu errado' });
    }
    const selectedItens = await (0, queryGroup_1.selectedItensFromOdf)(groupOdf, indexOdf);
    console.log('linha 45', selectedItens.odf);
    if (selectedItens.odf.QTDE_ODF - selectedItens.odf.QTDE_APONTADA === 0) {
        return res.json({ message: 'Não há limite na ODF' });
    }
    else if (indexOdf === 0) {
        selectedItens.odf.QTDE_LIB = selectedItens.odf.QTDE_ODF - selectedItens.odf.QTDE_APONTADA;
    }
    else {
        if (selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA === 0) {
            return res.json({ message: 'Não há limite na ODF' });
        }
        else {
            selectedItens.odf.QTDE_LIB = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA;
        }
    }
    let lookForChildComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(dados, selectedItens.odf.QTDE_LIB, funcionario, selectedItens.odf.NUMERO_OPERACAO, selectedItens.odf.CODIGO_PECA, selectedItens.odf.REVISAO);
    if (lookForChildComponents.message === 'Quantidade para reserva inválida') {
        await (0, clearCookie_1.cookieCleaner)(res);
        return res.json({ message: 'Quantidade para reserva inválida' });
    }
    if (lookForChildComponents.quantidade < selectedItens.odf.QTDE_LIB) {
        selectedItens.odf.QTDE_LIB = lookForChildComponents.quantidade;
        let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${lookForChildComponents.quantidade} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`;
        await (0, update_1.update)(y);
    }
    else {
        let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${selectedItens.odf.QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${dados.numOper}`;
        await (0, update_1.update)(y);
    }
    selectedItens.odf.condic = lookForChildComponents.condic;
    selectedItens.odf.execut = lookForChildComponents.execut;
    selectedItens.odf.codigoFilho = lookForChildComponents.codigoFilho;
    selectedItens.odf.startProd = new Date().getTime();
    await (0, cookieGenerator_1.cookieGenerator)(res, selectedItens.odf);
    res.cookie('encodedOdfNumber', (0, encodedOdf_1.encoded)(String(selectedItens.odf.NUMERO_ODF)), { httpOnly: true });
    const pointCode = await (0, codeNote_1.codeNote)(dados.numOdf, dados.numOper, dados.codMaq);
    return res.json({ message: pointCode });
};
exports.searchOdf = searchOdf;
//# sourceMappingURL=searchOdf.js.map