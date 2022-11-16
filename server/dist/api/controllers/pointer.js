"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointerPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const select_1 = require("../services/select");
const selectIfHasP_1 = require("../services/selectIfHasP");
const encodedOdf_1 = require("../utils/encodedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const pointerPost = async (req, res, next) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    let message = String(req.body.message) || null;
    let qtdLib = 0;
    let apontLib = '';
    let qntdeJaApontada = 0;
    let qtdLibMax = 0;
    let codigoMaquinaProxOdf;
    let codMaqProxOdf;
    const queryGrupoOdf = await (0, select_1.selectOdfFromPcp)(dados);
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
    if (objOdfSelecionada['CODIGO_MAQUINA'] === 'RET001') {
        objOdfSelecionada['CODIGO_MAQUINA'] = 'RET001';
    }
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let codigoPeca = String(req.cookies['CODIGO_PECA']) || null;
    let revisao = String(req.cookies['REVISAO']) || null;
    let startTime = Number(req.cookies['starterBarcode']) || 0;
    let numeroOdf = String(objOdfSelecionada['NUMERO_ODF']);
    let cryptoOdfString = (0, encryptOdf_1.encryptedOdf)(numeroOdf);
    const encodedOdf = (0, encodedOdf_1.encodedOdfString)(numeroOdf);
    res.cookie('odfCryptografada', cryptoOdfString);
    res.cookie('encodedOdfString', encodedOdf);
    res.cookie('qtdLibMax', qtdLibMax);
    res.cookie('starterBarcode', startTime);
    res.cookie('MAQUINA_PROXIMA', codigoMaquinaProxOdf);
    res.cookie('OPERACAO_PROXIMA', codMaqProxOdf);
    res.cookie('NUMERO_ODF', objOdfSelecionada['NUMERO_ODF']);
    res.cookie('CODIGO_PECA', objOdfSelecionada['CODIGO_PECA']);
    res.cookie('CODIGO_MAQUINA', objOdfSelecionada['CODIGO_MAQUINA']);
    res.cookie('NUMERO_OPERACAO', numeroOper);
    res.cookie('REVISAO', objOdfSelecionada['REVISAO']);
    if (revisao === null) {
        revisao = '0';
    }
    console.log("linha revisao", revisao);
    console.log("linha revisao", dados.numOper);
    console.log("linha revisao", dados.numOdf);
    console.log("linha revisao", dados.codMaq);
    console.log("fuync", funcionario);
    if (message === 'insira cod 1' || message === 'codeApont 6 processo finalizado') {
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', ${dados.numOdf}, '${codigoPeca}', ${queryGrupoOdf[0].REVISAO},'${dados.numOper}', '${dados.numOper}', 'D', '${dados.codMaq}',0, 0, 0, '${funcionario}', '0', 1, '1', 'Ini Set.', 0, 0, '1', 0, 0 )
        `);
    }
    console.log("linha 127");
    if (message === 'codeApont 1 setup iniciado') {
        console.log("linha 128", message);
        return res.json({ message: 'codeApont 1 setup iniciado' });
    }
    if (message === 'codeApont 2 setup finalizado') {
        return res.json({ message: 'codeApont 2 setup finalizado' });
    }
    console.log("linha 135");
    try {
        if (message === 'codeApont 3 prod iniciado') {
            console.log("message", message);
            return res.json({ message: 'codeApont 3 prod iniciado' });
        }
    }
    catch (error) {
        console.log('linha 141', error);
    }
    console.log("linha 139", message);
    if (message === 'codeApont 4 prod finalzado') {
        return res.json({ message: 'codeApont 4 prod finalzado' });
    }
    if (message === 'codeApont 5 maquina parada') {
        return res.json({ message: 'codeApont 5 maquina parada' });
    }
    if (message === 'qualquer outro codigo') {
        return res.json({ message: 'qualquer outro codigo' });
    }
    let data = await (0, selectIfHasP_1.selectToKnowIfHasP)(dados);
    if (data === 'não foi necessario reservar') {
        return res.json({ message: 'não foi necessario reservar' });
    }
    if (data === 'valores reservados') {
        res.cookie('reservedItens', data.reservedItens);
        res.cookie('codigoFilho', data.codigoFilho);
        res.cookie('CONDIC', data.selectKnowHasP[0].CONDIC);
        res.cookie('NUMITE', data.codigoNumite);
        res.cookie('resultadoFinalProducao', data.resultadoFinalProducao);
    }
};
exports.pointerPost = pointerPost;
//# sourceMappingURL=pointer.js.map