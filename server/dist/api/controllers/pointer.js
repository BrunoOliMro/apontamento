"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointerPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const pointerPost = async (req, res, next) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    let message = String(req.body.message);
    const queryGrupoOdf = await connection.query(`
    SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' ORDER BY NUMERO_OPERACAO ASC
    `).then(result => result.recordset);
    if (queryGrupoOdf.length <= 0) {
        return res.json({ message: 'odf não encontrada' });
    }
    let codigoOperArray = queryGrupoOdf.map(e => e.NUMERO_OPERACAO);
    let arrayAfterMap = codigoOperArray.map(e => '00' + e).toString().replaceAll(' ', '0').split(',');
    let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((callback) => callback === dados.numOper);
    if (indiceDoArrayDeOdfs <= 0) {
        indiceDoArrayDeOdfs = 0;
    }
    let objOdfSelecionada = queryGrupoOdf[indiceDoArrayDeOdfs];
    let objOdfSelecProximo = queryGrupoOdf[indiceDoArrayDeOdfs + 1];
    let objOdfSelecAnterior = queryGrupoOdf[indiceDoArrayDeOdfs - 1];
    let qtdLib = 0;
    let apontLib = '';
    let qntdeJaApontada = 0;
    let qtdLibMax = 0;
    let codigoMaquinaProxOdf;
    let codMaqProxOdf;
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
    console.log('codigoMaq linha 108', message);
    res.cookie('qtdLibMax', qtdLibMax);
    res.cookie('MAQUINA_PROXIMA', codigoMaquinaProxOdf);
    res.cookie('OPERACAO_PROXIMA', codMaqProxOdf);
    res.cookie('NUMERO_ODF', objOdfSelecionada['NUMERO_ODF']);
    res.cookie('CODIGO_PECA', objOdfSelecionada['CODIGO_PECA']);
    res.cookie('CODIGO_MAQUINA', objOdfSelecionada['CODIGO_MAQUINA']);
    res.cookie('NUMERO_OPERACAO', numeroOper);
    res.cookie('REVISAO', objOdfSelecionada['REVISAO']);
    if (message === 'codeApont 2 setup finalizado') {
        return res.json({ message: 'codeApont 2 setup finalizado' });
    }
    if (message === 'codeApont 3 prod iniciado') {
        return res.json({ message: 'codeApont 3 prod iniciado' });
    }
    if (message === 'codeApont 4 prod finalzado') {
        return res.json({ message: 'codeApont 4 prod finalzado' });
    }
    if (message === 'codeApont 5 prod iniciado') {
        return res.json({ message: 'codeApont 5 prod iniciado' });
    }
    if (message === 'codeApont 6 prod iniciado') {
        return res.json({ message: 'codeApont 6 prod iniciado' });
    }
    if (message === 'qualquer outro codigo') {
        return res.json({ message: 'qualquer outro codigo' });
    }
    try {
        const selectKnowHasP = await connection.query(`
                    SELECT DISTINCT                 
                       OP.NUMITE,                 
                       CAST(OP.EXECUT AS INT) AS EXECUT,
                       CONDIC,       
                       CAST(E.SALDOREAL AS INT) AS SALDOREAL,                 
                       CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,
                       ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as saldo_alocado
                       FROM PROCESSO PRO (NOLOCK)                  
                       INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O_                  
                       INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITE                
                       INNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEC                
                       WHERE 1=1                    
                       AND PRO.ATIVO ='S'                   
                       AND PRO.CONCLUIDO ='T'                
                       AND OP.CONDIC ='P'                 
                       AND PCP.NUMERO_ODF = '${dados.numOdf}'    
                    `.trim()).then(result => result.recordset);
        if (selectKnowHasP.length > 0) {
            res.cookie('CONDIC', selectKnowHasP[0].CONDIC);
            let codigoNumite = selectKnowHasP.map(e => e.NUMITE);
            res.cookie('NUMITE', codigoNumite);
            function calMaxQuant(qtdNecessPorPeca, saldoReal) {
                const pecasPaiPorComponente = qtdNecessPorPeca.map((qtdPorPeca, i) => {
                    return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
                });
                const qtdMaxProduzivel = pecasPaiPorComponente.reduce((qtdMax, pecasPorComp) => {
                    return Math.min(qtdMax, pecasPorComp);
                }, Infinity);
                Math.round(qtdMaxProduzivel);
                return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
            }
            const execut = selectKnowHasP.map(item => item.EXECUT);
            const saldoReal = selectKnowHasP.map(item => item.SALDOREAL);
            let qtdTotal = calMaxQuant(execut, saldoReal);
            const reservedItens = execut.map((quantItens) => {
                return Math.floor((qtdTotal || 0) * quantItens);
            }, Infinity);
            res.cookie('reservedItens', reservedItens);
            const codigoFilho = selectKnowHasP.map(item => item.NUMITE);
            res.cookie('codigoFilho', codigoFilho);
            let qtdProdOdf = Number(selectKnowHasP[0].QTDE_ODF);
            let resultadoFinalProducao = Number(Number(qtdTotal) - Number(qtdProdOdf));
            if (resultadoFinalProducao <= 0) {
                resultadoFinalProducao = 0;
                return resultadoFinalProducao;
            }
            res.cookie('resultadoFinalProducao', resultadoFinalProducao);
            const updateQtyQuery = [];
            const updateQtyRes = [];
            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            }
            await connection.query(updateQtyQuery.join('\n'));
            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            }
            await connection.query(updateQtyRes.join('\n'));
            return res.json({ message: `valores reservados` });
        }
        if (selectKnowHasP.length <= 0) {
            return res.json({ message: 'não foi necessario reservar' });
        }
    }
    catch (error) {
        console.log('linha 214: ', error);
        return res.json({ message: 'CATCH ERRO NO TRY' });
    }
    finally {
    }
};
exports.pointerPost = pointerPost;
//# sourceMappingURL=pointer.js.map