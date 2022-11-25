"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOdf = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const select_1 = require("../services/select");
const selectIfHasP_1 = require("../services/selectIfHasP");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encodedOdf_1 = require("../utils/encodedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const odfIndex_1 = require("../utils/odfIndex");
const queryGroup_1 = require("../utils/queryGroup");
const searchOdf = async (req, res) => {
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.barcode);
    let qtdLibMax = 0;
    const lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    const groupOdf = await (0, select_1.select)(lookForOdfData);
    if (!groupOdf) {
        return res.json({ message: 'odf não encontrada' });
    }
    let indexOdf = await (0, odfIndex_1.odfIndex)(groupOdf, dados.numOper);
    if (!indexOdf) {
        return res.json({ message: 'Algo deu errado' });
    }
    const selectedItens = await (0, queryGroup_1.selectedItensFromOdf)(groupOdf, indexOdf);
    if (selectedItens.odf.QTDE_APONTADA - selectedItens.beforeOdf.QTDE_APONTADA === 0) {
        return res.status(400).json({ message: 'não há limite na odf' });
    }
    qtdLibMax = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA;
    let numeroOper = '00' + selectedItens.odf.NUMERO_OPERACAO.replaceAll(' ', '0');
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['employee'])));
    if (!funcionario) {
        return res.json({ message: 'Algo deu errado' });
    }
    let qtdLibString = (0, encryptOdf_1.encrypted)(String(qtdLibMax));
    let encryptedOdfNumber = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.NUMERO_ODF));
    const encryptedNextMachine = (0, encryptOdf_1.encrypted)(String(selectedItens.nextOdf.CODIGO_MAQUINA));
    const encryptedNextOperation = (0, encryptOdf_1.encrypted)(String(selectedItens.nextOdf.NUMERO_OPERACAO));
    const encryptedCodePart = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.CODIGO_PECA));
    const encryptedMachineCode = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.CODIGO_MAQUINA));
    const operationNumber = (0, encryptOdf_1.encrypted)(String(numeroOper));
    const encryptedRevision = (0, encryptOdf_1.encrypted)(String(selectedItens.odf.REVISAO));
    const encodedOdfNumber = (0, encodedOdf_1.encoded)(String(selectedItens.odf.NUMERO_ODF));
    const encodedOperationNumber = (0, encodedOdf_1.encoded)(String(numeroOper));
    const encodedMachineCode = (0, encodedOdf_1.encoded)(String(selectedItens.odf.CODIGO_MAQUINA));
    res.cookie('NUMERO_ODF', encryptedOdfNumber);
    res.cookie('encodedOdfNumber', encodedOdfNumber);
    res.cookie('encodedOperationNumber', encodedOperationNumber);
    res.cookie('encodedMachineCode', encodedMachineCode);
    res.cookie('qtdLibMax', qtdLibString);
    res.cookie('MAQUINA_PROXIMA', encryptedNextMachine);
    res.cookie('OPERACAO_PROXIMA', encryptedNextOperation);
    res.cookie('CODIGO_PECA', encryptedCodePart);
    res.cookie('CODIGO_MAQUINA', encryptedMachineCode);
    res.cookie('NUMERO_OPERACAO', operationNumber);
    res.cookie('REVISAO', encryptedRevision);
    let lookForChildComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(dados, qtdLibMax, funcionario, numeroOper, selectedItens.odf.CODIGO_PECA);
    if (lookForChildComponents.reserved > qtdLibMax) {
        lookForChildComponents.reserved = qtdLibMax;
    }
    if (!lookForChildComponents || lookForChildComponents === 'Quantidade para reserva inválida') {
        return res.json({ message: 'Algo deu errado' });
    }
    if (lookForChildComponents.message === 'Algo deu errado') {
        return res.json({ message: 'Algo deu errado' });
    }
    if (lookForChildComponents.message === 'Valores Reservados') {
        res.cookie('reservedItens', lookForChildComponents.reserved);
        res.cookie('codigoFilho', lookForChildComponents.codigoFilho);
        res.cookie('condic', lookForChildComponents.condic);
        res.cookie('quantidade', lookForChildComponents.quantidade);
        return res.json({ message: 'Valores Reservados' });
    }
    if (lookForChildComponents.message === 'Quantidade para reserva inválida') {
        return res.json({ message: 'Quantidade para reserva inválida' });
    }
    if (lookForChildComponents.message === 'Não há item para reservar') {
        return res.json({ message: 'Não há item para reservar' });
    }
    else {
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.searchOdf = searchOdf;
//# sourceMappingURL=searchOdf.js.map