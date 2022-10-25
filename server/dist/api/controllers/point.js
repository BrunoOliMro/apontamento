"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const sanitize_1 = require("../utils/sanitize");
const point = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let qtdBoas = Number((0, sanitize_1.sanitize)(req.body["valorFeed"])) || 0;
    let supervisor = String((0, sanitize_1.sanitize)(req.body["supervisor"])) || null;
    let motivorefugo = String((0, sanitize_1.sanitize)(req.body["value"])) || null;
    let badFeed = Number((0, sanitize_1.sanitize)(req.body["badFeed"])) || 0;
    let missingFeed = Number((0, sanitize_1.sanitize)(req.body["missingFeed"])) || 0;
    let reworkFeed = Number((0, sanitize_1.sanitize)(req.body["reworkFeed"])) || 0;
    let parcialFeed = Number((0, sanitize_1.sanitize)(req.body["parcialFeed"])) || 0;
    var codigoFilho = ((req.cookies['codigoFilho']));
    var reservedItens = (req.cookies['reservedItens']);
    let NUMERO_ODF = Number((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])) || 0;
    let NUMERO_OPERACAO = String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"])) || null;
    let codigoPeca = String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])) || null;
    let CODIGO_MAQUINA = String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"])) || null;
    let qtdLibMax = Number((0, sanitize_1.sanitize)(req.cookies['qtdLibMax'])) || 0;
    let condic = String((0, sanitize_1.sanitize)(req.cookies['CONDIC'])) || null;
    let MAQUINA_PROXIMA = String((0, sanitize_1.sanitize)(req.cookies['MAQUINA_PROXIMA'])) || null;
    let OPERACAO_PROXIMA = String((0, sanitize_1.sanitize)(req.cookies['OPERACAO_PROXIMA'])) || null;
    let funcionario = String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])) || null;
    let revisao = Number((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || 0;
    const updateQtyQuery = [];
    let startRip = Number(new Date()) || 0;
    let state = Number(0);
    res.cookie("startRip", startRip);
    let endProdTimer = new Date() || 0;
    let startProd = Number(req.cookies["startProd"] / 1000) || 0;
    let finalProdTimer = Number(endProdTimer.getTime() - startProd / 1000) || 0;
    let valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed) + Number(parcialFeed));
    valorTotalApontado = Number(valorTotalApontado);
    qtdLibMax = Number(qtdLibMax);
    if (motivorefugo === undefined) {
        motivorefugo = null;
    }
    if (valorTotalApontado > qtdLibMax) {
        return res.json({ message: 'valor apontado maior que a quantidade liberada' });
    }
    if (badFeed > 0) {
        const resource = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'
        `).then(result => result.recordset);
        if (resource.length <= 0) {
            return res.json({ message: 'supervisor não encontrado' });
        }
    }
    if (condic === undefined || condic === null) {
        condic = "D";
        codigoFilho = [];
    }
    try {
        state = 0;
        if (condic === 'P') {
            try {
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                }
                await connection.query(updateQtyQuery.join("\n"));
            }
            catch (err) {
                return res.json({ message: 'erro ao efetivar estoque das peças filhas ' });
            }
        }
        state = 1;
    }
    catch (err) {
        state = 0;
        console.log(err);
        return res.json({ message: 'erro ao verificar o "P' });
    }
    try {
        state = 3;
        if (CODIGO_MAQUINA === "EX002") {
            console.log("linha 648/");
            if (CODIGO_MAQUINA !== 'EX002') {
                console.log('não vai executar aqui linha 651');
                const s = await connection.query(`
            SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
            LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
            WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('00240174-1') ORDER BY CE.ENDERECO ASC`).then(result => result.recordset);
                if (s.length > 0) {
                    return res.json(s);
                }
                if (s.length <= 0) {
                    console.log('não vai executar aqui linha 661');
                    const e = await connection.query(`
                    SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('00240174-1') ORDER BY CE.ENDERECO ASC`).then(result => result.recordset);
                    return res.json(e);
                }
            }
            if (CODIGO_MAQUINA === 'EX002') {
                console.log('vai executar aqui linha 670');
            }
            state = 4;
            try {
                state = 5;
                if (CODIGO_MAQUINA === 'EX002') {
                    console.log("baixa no estoque");
                    const updateProxOdfToS = await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 =1 AND CODIGO = '${codigoPeca}'`);
                    console.log('updateProxOdfToS: ', updateProxOdfToS);
                }
                else {
                    const updateProxOdfToS = await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 =1 AND CODIGO = '${codigoPeca}'`);
                    console.log('updateProxOdfToS: linha 655 ', updateProxOdfToS);
                }
                state = 6;
            }
            catch (error) {
                state = 5;
                console.log(error);
                return res.json({ message: 'erro ao inserir estoque' });
            }
        }
    }
    catch (error) {
        state = 3;
        console.log(error);
        return res.json({ message: 'erro ao em localizar espaço' });
    }
    const hisReal = await connection.query(`SELECT TOP 1 SALDO FROM  HISREAL WHERE 1 = 1`).then(record => record.recordset);
    try {
        state = 7;
        await connection.query(`
        SELECT E.CODIGO,CAST('${NUMERO_ODF}' + '/' + 'DATA HORA' AS VARCHAR(200)),
        '${qtdBoas}',
        MAX(VALPAGO),
        'E', ('${hisReal[0].SALDO}' + '${qtdBoas}'),
        GETDATE(),0,'${funcionario}','${NUMERO_ODF}',0,1,1,MAX(CUSTO_MEDIO),MAX(CUSTO_TOTAL),
        MAX(CUSTO_UNITARIO),MAX(CATEGORIA),MAX(E.DESCRI),1,MAX(E.UNIDADE),'S','N','APONTAMENTO',
        'VERSAO DO APONTAMENTO','47091','7C1501-04','${CODIGO_MAQUINA}' 
        FROM ESTOQUE E(NOLOCK)
        WHERE 1 = 1 
        AND E.CODIGO ='${codigoPeca}' GROUP BY E.CODIGO;`);
        state = 8;
    }
    catch (error) {
        state = 7;
        console.log(error);
        return res.json({ message: 'erro ao enviar o apontamento' });
    }
    try {
        state = 9;
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        }
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`);
        }
        if (valorTotalApontado >= qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        }
        await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        await connection.query(` INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
        VALUES(GETDATE(),'${funcionario}',${NUMERO_ODF},'${codigoPeca}','${revisao}','${NUMERO_OPERACAO}','${NUMERO_OPERACAO}', 'D','${CODIGO_MAQUINA}','1',${qtdBoas},${badFeed},'${funcionario}','0','4', '4', 'Fin Prod.',${finalProdTimer},${finalProdTimer}, '1',  UPPER('${motivorefugo}') , ${missingFeed},${reworkFeed})`);
        state = 10;
        return res.json({ message: 'valores apontados com sucesso' });
    }
    catch (error) {
        state = 9;
        console.log(error);
        return res.json({ message: 'erro ao enviar o apontamento' });
    }
    finally {
    }
};
exports.point = point;
//# sourceMappingURL=point.js.map