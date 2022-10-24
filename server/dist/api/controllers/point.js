"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const point = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let qtdBoas = req.body['valorFeed'] || 0;
    let supervisor = req.body['supervisor'] || 0;
    let motivorefugo = req.body['value'] || null;
    let badFeed = req.body['badFeed'] || 0;
    let missingFeed = req.body['missingFeed'] || 0;
    let reworkFeed = req.body['reworkFeed'] || 0;
    let parcialFeed = req.body['parcialFeed'] || 0;
    var codigoFilho = req.cookies['codigoFilho'];
    var reservedItens = req.cookies['reservedItens'];
    let NUMERO_ODF = Number(req.cookies["NUMERO_ODF"]);
    let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"];
    let codigoPeca = req.cookies['CODIGO_PECA'];
    let CODIGO_MAQUINA = String(req.cookies["CODIGO_MAQUINA"]);
    console.log("codigo: ", CODIGO_MAQUINA);
    let qtdLibMax = req.cookies['qtdLibMax'];
    let condic = req.cookies['CONDIC'];
    let MAQUINA_PROXIMA = req.cookies['MAQUINA_PROXIMA'];
    let OPERACAO_PROXIMA = req.cookies['OPERACAO_PROXIMA'];
    let funcionario = req.cookies['FUNCIONARIO'];
    let revisao = Number(req.cookies['REVISAO']) || 0;
    const updateQtyQuery = [];
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input && input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }
    qtdBoas = sanitize(req.body["valorFeed"]) || 0;
    badFeed = sanitize(req.body["badFeed"]) || 0;
    missingFeed = sanitize(req.body["missingFeed"]) || 0;
    reworkFeed = sanitize(req.body["reworkFeed"]) || 0;
    parcialFeed = sanitize(req.body["parcialFeed"]) || 0;
    supervisor = sanitize(req.body["supervisor"]);
    motivorefugo = sanitize(req.body["value"]) || null;
    let startRip = new Date();
    res.cookie("startRip", startRip);
    let endProdTimer = new Date();
    let startProd = req.cookies["startProd"] / 1000;
    let finalProdTimer = endProdTimer.getTime() - startProd / 1000;
    let valorTotalApontado = parseInt(Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed) + Number(parcialFeed));
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
    valorTotalApontado = Number(valorTotalApontado);
    qtdLibMax = Number(qtdLibMax);
    if (condic === undefined || condic === null) {
        condic = 0;
        codigoFilho = 0;
    }
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
    console.log('codigo Ope', NUMERO_OPERACAO);
    if (CODIGO_MAQUINA === 'RET01') {
        CODIGO_MAQUINA = 'RET001';
    }
    console.log('codigo Maq', CODIGO_MAQUINA);
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
        try {
            if (CODIGO_MAQUINA === 'EX002') {
                console.log("baixa no estoque");
                const updateProxOdfToS = await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 =1 AND CODIGO = '${codigoPeca}'`);
                console.log('updateProxOdfToS: ', updateProxOdfToS);
            }
            else {
                const updateProxOdfToS = await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 =1 AND CODIGO = '${codigoPeca}'`);
                console.log('updateProxOdfToS: linha 655 ', updateProxOdfToS);
            }
        }
        catch (error) {
            console.log(error);
            return res.json({ message: 'erro ao inserir estoque' });
        }
    }
    const hisReal = await connection.query(`SELECT TOP 1 SALDO FROM  HISREAL WHERE 1 = 1`).then(record => record.recordset);
    try {
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
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro ao enviar o apontamento' });
    }
    try {
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
        console.log("ivghbwr", NUMERO_ODF);
        console.log('numer', CODIGO_MAQUINA);
        await connection.query(` INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
        VALUES(GETDATE(),'${funcionario}',${NUMERO_ODF},'${codigoPeca}','${revisao}','${NUMERO_OPERACAO}','${NUMERO_OPERACAO}', 'D','QUA002','1',${qtdBoas},${badFeed},'${funcionario}','0','4', '4', 'Fin Prod.',${finalProdTimer},${finalProdTimer}, '1',  UPPER('${motivorefugo}') , ${missingFeed},${reworkFeed})`);
        return res.json({ message: 'valores apontados com sucesso' });
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro ao enviar o apontamento' });
    }
    finally {
    }
};
exports.point = point;
//# sourceMappingURL=point.js.map