"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointerPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const select_1 = require("../services/select");
const selectIfHasP_1 = require("../services/selectIfHasP");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encodedOdf_1 = require("../utils/encodedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const pointerPost = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    let message = String(req.body.message) || null;
    let qtdLib = 0;
    let apontLib = '';
    let qntdeJaApontada = 0;
    let qtdLibMax = 0;
    let codigoMaquinaProxOdf;
    let codMaqProxOdf;
    if (message === 'codeApont 1 setup iniciado') {
        return res.json({ message: 'codeApont 1 setup iniciado' });
    }
    if (message === `codeApont 4 prod finalzado`) {
        return res.json({ message: 'codeApont 4 prod finalzado' });
    }
    if (message === `codeApont 5 maquina parada`) {
        return res.json({ message: 'codeApont 5 maquina parada' });
    }
    const queryGrupoOdf = await (0, select_1.selectOdfFromPcp)(dados);
    console.log("linha 38 /pointer/");
    if (queryGrupoOdf.message === 'odf não encontrada') {
        return res.json({ message: 'odf não encontrada' });
    }
    let codigoOperArray = queryGrupoOdf.map((e) => e.NUMERO_OPERACAO);
    let arrayAfterMap = codigoOperArray.map((e) => '00' + e).toString().replaceAll(' ', '0').split(',');
    let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((callback) => callback === dados.numOper);
    if (indiceDoArrayDeOdfs <= 0) {
        indiceDoArrayDeOdfs = 0;
    }
    let objOdfSelecionada = queryGrupoOdf[indiceDoArrayDeOdfs];
    let objOdfSelecProximo = queryGrupoOdf[indiceDoArrayDeOdfs + 1];
    let objOdfSelecAnterior = queryGrupoOdf[indiceDoArrayDeOdfs - 1];
    if (indiceDoArrayDeOdfs === 0) {
        codigoMaquinaProxOdf = objOdfSelecProximo['CODIGO_MAQUINA'];
        codMaqProxOdf = objOdfSelecProximo['NUMERO_OPERACAO'];
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA'];
        qtdLib = objOdfSelecionada['QTDE_ODF'];
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO'];
    }
    if (indiceDoArrayDeOdfs === codigoOperArray.length - 1) {
        codigoMaquinaProxOdf = objOdfSelecionada['CODIGO_MAQUINA'];
        codMaqProxOdf = objOdfSelecionada['NUMERO_OPERACAO'];
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA'];
        qtdLib = objOdfSelecAnterior['QTDE_APONTADA'];
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO'];
    }
    if (indiceDoArrayDeOdfs > 0 && indiceDoArrayDeOdfs < codigoOperArray.length - 1) {
        codigoMaquinaProxOdf = objOdfSelecProximo['CODIGO_MAQUINA'];
        codMaqProxOdf = objOdfSelecProximo['NUMERO_OPERACAO'];
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA'];
        qtdLib = objOdfSelecAnterior['QTDE_APONTADA'];
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO'];
    }
    if (qtdLib - qntdeJaApontada === 0) {
        return res.status(400).json({ message: 'não há limite na odf' });
    }
    qtdLibMax = qtdLib - qntdeJaApontada;
    if (objOdfSelecAnterior === undefined) {
        await connection.query(`
        UPDATE 
        PCP_PROGRAMACAO_PRODUCAO 
        SET 
        APONTAMENTO_LIBERADO = 'S' 
        WHERE 1 = 1 
        AND NUMERO_ODF = '${dados.numOdf}' 
        AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' 
        AND CODIGO_MAQUINA = '${dados.codMaq}'`);
    }
    if (objOdfSelecAnterior === undefined) {
        objOdfSelecAnterior = 0;
    }
    let numeroOper = '00' + objOdfSelecionada.NUMERO_OPERACAO.replaceAll(' ', '0');
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO'])));
    if (!funcionario) {
        return res.json({ message: 'Algo deu errado' });
    }
    let qtdLibString = (0, encryptOdf_1.encrypted)(String(qtdLibMax));
    let encryptedOdfNumber = (0, encryptOdf_1.encrypted)(String(objOdfSelecionada['NUMERO_ODF']));
    const encryptedNextMachine = (0, encryptOdf_1.encrypted)(String(codigoMaquinaProxOdf));
    const encryptedNextOperation = (0, encryptOdf_1.encrypted)(String(codMaqProxOdf));
    const encryptedCodePart = (0, encryptOdf_1.encrypted)(String(objOdfSelecionada['CODIGO_PECA']));
    const encryptedMachineCode = (0, encryptOdf_1.encrypted)(String(objOdfSelecionada['CODIGO_MAQUINA']));
    const operationNumber = (0, encryptOdf_1.encrypted)(String(numeroOper));
    const encryptedRevision = (0, encryptOdf_1.encrypted)(String(objOdfSelecionada['REVISAO']));
    const encodedOdfNumber = (0, encodedOdf_1.encoded)(String(objOdfSelecionada['NUMERO_ODF']));
    const encodedOperationNumber = (0, encodedOdf_1.encoded)(String(numeroOper));
    const encodedMachineCode = (0, encodedOdf_1.encoded)(String(objOdfSelecionada['CODIGO_MAQUINA']));
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
    console.log("linha 146 /pointer/");
    if (message === 'codeApont 2 setup finalizado') {
        return res.json({ message: 'codeApont 1 setup iniciado' });
    }
    if (message === `codeApont 3 prod iniciado`) {
        return res.json({ message: 'codeApont 3 prod iniciado' });
    }
    let data = await (0, selectIfHasP_1.selectToKnowIfHasP)(dados);
    if (data === 'valores reservados') {
        res.cookie('reservedItens', data.reservedItens);
        res.cookie('codigoFilho', data.codigoFilho);
        res.cookie('CONDIC', data.selectKnowHasP[0].CONDIC);
        res.cookie('NUMITE', data.codigoNumite);
        res.cookie('resultadoFinalProducao', data.resultadoFinalProducao);
    }
    return res.json({ message: 'codeApont 1 setup iniciado' });
};
exports.pointerPost = pointerPost;
//# sourceMappingURL=pointer.js.map