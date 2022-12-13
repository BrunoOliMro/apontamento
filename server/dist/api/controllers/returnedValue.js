"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnedValue = void 0;
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const update_1 = require("../services/update");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const odfIndex_1 = require("../utils/odfIndex");
const queryGroup_1 = require("../utils/queryGroup");
const sanitize_1 = require("../utils/sanitize");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const returnedValue = async (req, res) => {
    const choosenOption = Number((0, sanitize_1.sanitize)(req.body["quantity"])) || null;
    const supervisor = (0, sanitize_1.sanitize)(req.body["supervisor"]) || null;
    const returnValues = String((0, sanitize_1.sanitize)(req.body['returnValueStorage'])) || null;
    if (!returnValues) {
        return res.json({ message: 'Não foi indicado boas e ruins' });
    }
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CRACHA']))) || null;
    const data = (0, unravelBarcode_1.unravelBarcode)((0, sanitize_1.sanitize)(req.body["barcodeReturn"])) || null;
    const lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${data.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
    let boas = null;
    let ruins = null;
    const codAponta = 8;
    let descricaoCodigoAponta = null;
    let motivo = null;
    let tempoDecorrido = null;
    var response = {
        message: '',
    };
    if (!funcionario) {
        return res.json({ message: 'Funcionário inválido' });
    }
    if (!data && !choosenOption && !supervisor) {
        return res.json({ message: "ODF não encontrada" });
    }
    if (!data) {
        return res.json({ message: "Código de barras vazio" });
    }
    if (!supervisor) {
        return res.json({ message: 'Crachá de supervisor inválido' });
    }
    if (!choosenOption) {
        return res.json({ message: "Categoria de peças não foi apontado" });
    }
    if (returnValues === 'BOAS') {
        boas = choosenOption;
    }
    if (returnValues === 'RUINS') {
        ruins = choosenOption;
    }
    if (!boas) {
        boas = 0;
    }
    if (!ruins) {
        ruins = 0;
    }
    const codeNoteResult = await (0, codeNote_1.codeNote)(data.numOdf, data.numOper, data.codMaq, funcionario);
    console.log('linha 68 /return/', codeNoteResult);
    if (codeNoteResult.message !== 'Begin new process') {
        return res.json({ message: 'Not possible to return' });
    }
    let valorTotal = boas + ruins;
    const groupOdf = await (0, select_1.select)(lookForOdfData);
    let indexOdf = await (0, odfIndex_1.odfIndex)(groupOdf, data.numOper);
    const selectedItens = await (0, queryGroup_1.selectedItensFromOdf)(groupOdf, indexOdf);
    console.log('LINHA 69', selectedItens.odf);
    if (!selectedItens.odf) {
        response.message = 'Invalid ODF';
    }
    else if (selectedItens.odf.QTDE_APONTADA <= 0 || selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTDE_ODF === 0) {
        return res.json({ message: "No limit" });
    }
    else if ("00" + selectedItens.odf.NUMERO_OPERACAO.replaceAll(' ', '0') !== data.numOper) {
        response.message = 'Invalid ODF';
        return res.json(response);
    }
    else if (!selectedItens.odf.QTD_REFUGO && ruins > 0) {
        console.log('linha 79');
        response.message = 'Bad feed invalid';
        return res.json(response);
    }
    else if (selectedItens.odf.QTDE_APONTADA < valorTotal) {
        console.log('linha 84');
        response.message = 'No limit';
        return res.json(response);
    }
    else {
        let codigoPeca = String(selectedItens.odf.CODIGO_PECA);
        let revisao = String(selectedItens.odf.REVISAO);
        let qtdLib = selectedItens.odf.QTDE_LIB - valorTotal;
        let faltante = selectedItens.odf.QTD_FALTANTE - valorTotal;
        let retrabalhada = null;
        let qtdLibMax = selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTDE_ODF;
        const selectSuper = await (0, select_1.select)(lookForSupervisor);
        if (selectSuper.length > 0) {
            try {
                const insertHisCodReturned = await (0, insert_1.insertInto)(funcionario, data.numOdf, codigoPeca, revisao, data.numOper, data.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido);
                if (insertHisCodReturned) {
                    const updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - ${boas}, QTD_FALTANTE = QTD_FALTANTE - ${faltante}, QTDE_LIB = ${qtdLib} ,QTD_REFUGO = QTD_REFUGO - ${ruins} WHERE 1 = 1 AND NUMERO_ODF = '${data.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${data.numOper}' AND CODIGO_MAQUINA = '${data.codMaq}'`;
                    const updateValuesOnPcp = await (0, update_1.update)(updateQuery);
                    if (updateValuesOnPcp === 'Update sucess') {
                        return res.status(200).json({ message: 'Returned values done' });
                    }
                    else {
                        return res.json({ message: 'Return error' });
                    }
                }
                else {
                    return res.json({ message: 'Return error' });
                }
            }
            catch (error) {
                console.log(error);
                return res.json({ message: 'Return error' });
            }
        }
        else {
            return res.json({ message: 'Return error' });
        }
    }
};
exports.returnedValue = returnedValue;
//# sourceMappingURL=returnedValue.js.map