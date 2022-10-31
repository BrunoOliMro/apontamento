"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoint = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const getPoint = async (req, res) => {
    console.log(" aerub eur bububru");
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let NUMERO_ODF = Number((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"])) || 0;
    let qtdBoas = Number((req.cookies["qtdBoas"])) || 0;
    const NUMERO_OPERACAO = req.cookies['NUMERO_OPERACAO'];
    const CODIGO_MAQUINA = req.cookies['CODIGO_MAQUINA'];
    let codigoPeca = String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA'])) || null;
    let funcionario = String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO'])) || null;
    var address;
    const hostname = req.get("host");
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};
    var obj = {};
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    const ip = String(Object.entries(results)[0][1]);
    try {
        if (NUMERO_OPERACAO === "00999") {
            if (CODIGO_MAQUINA !== 'EX002') {
                const s = await connection.query(`
                    SELECT 
                    EE.CODIGO AS COD_PRODUTO, NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                    FROM 
                    CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}') 
                        ORDER BY CE.ENDERECO ASC`)
                    .then(result => result.recordset);
                const e = await connection.query(`
                    SELECT 
                    EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                    FROM 
                    CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE 
                    ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}') 
                    ORDER BY CE.ENDERECO ASC`)
                    .then(result => result.recordset);
                const add = (s.map((callback) => callback.QUANTIDADE));
                const ç = (e.map((callback) => callback.QUANTIDADE));
                var choice;
                var resChoice;
                if (add.length > 0) {
                    obj = s;
                    choice = add;
                    resChoice = add;
                }
                else if (ç.length > 0) {
                    obj = e;
                    choice = ç;
                    resChoice = ç;
                }
                let smallerNumber = Math.min(...choice);
                let indiceDoArrayDeOdfs = choice.findIndex((callback) => callback === smallerNumber);
                obj = resChoice[indiceDoArrayDeOdfs];
                address = resChoice[indiceDoArrayDeOdfs].ENDERECO;
                console.log("linha 76", obj);
            }
            if (CODIGO_MAQUINA === 'EX002') {
                const exResource = await connection.query(`
                    SELECT
                    EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                    FROM 
                    CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE 
                    ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '7%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}')
                    ORDER BY CE.ENDERECO ASC`)
                    .then(result => result.recordset);
                let l = await connection.query(`
                    SELECT 
                    EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                    FROM 
                    CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE 
                    ISNULL(EE.QUANTIDADE,0) <= 0 AND CE.ENDERECO LIKE '7%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}')
                    ORDER BY CE.ENDERECO ASC`)
                    .then(result => result.recordset);
                const add = (exResource.map((callback) => callback.QUANTIDADE));
                const ç = (l.map((callback) => callback.QUANTIDADE));
                var choice;
                var resChoice;
                if (add.length > 0) {
                    obj = exResource;
                    choice = add;
                    resChoice = exResource;
                }
                else if (ç.length > 0) {
                    obj = l;
                    choice = ç;
                    resChoice = l;
                }
                let smallerNumber = Math.min(...choice);
                let indiceDoArrayDeOdfs = choice.findIndex((callback) => callback === smallerNumber);
                address = resChoice[indiceDoArrayDeOdfs].ENDERECO;
            }
            try {
                const hisReal = await connection.query(`SELECT TOP 1  * FROM HISREAL  WHERE 1 = 1 AND CODIGO = '${codigoPeca}' ORDER BY DATA DESC`)
                    .then(record => record.recordset);
                try {
                    const insertHisReal = await connection.query(`
                INSERT INTO HISREAL
                    (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
                SELECT 
                    CODIGO, '${NUMERO_ODF}/${codigoPeca}', GETDATE(), ${qtdBoas}, 0 , 'E', ${hisReal[0].SALDO} + ${qtdBoas}, GETDATE(), '0', '${funcionario}', '${NUMERO_ODF}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
                FROM ESTOQUE(NOLOCK)
                WHERE 1 = 1 
                AND CODIGO = '${codigoPeca}' 
                GROUP BY CODIGO`);
                    console.log("LINHA 106", insertHisReal);
                }
                catch (error) {
                    console.log('linha 103', error);
                    return res.json({ message: 'erro inserir em hisreal' });
                }
                try {
                    if (CODIGO_MAQUINA === 'EX002') {
                        await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${codigoPeca}'`);
                    }
                    else {
                        await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${codigoPeca}'`);
                    }
                    let objRes = {
                        address: address,
                        String: 'endereço com sucesso'
                    };
                    if (address === undefined) {
                        return res.json({ message: 'sem endereço' });
                    }
                    else {
                        return res.json(objRes);
                    }
                }
                catch (error) {
                    console.log(error);
                    return res.json({ message: 'erro ao inserir estoque' });
                }
            }
            catch (error) {
                console.log(error);
                return res.json({ message: 'erro ao em localizar espaço' });
            }
        }
        else {
            return res.json({ message: 'sem endereço' });
        }
    }
    catch (error) {
        console.log('linha 107', error);
        return res.json({ message: 'erro ao localizar os dados em hisreal' });
    }
};
exports.getPoint = getPoint;
//# sourceMappingURL=getPoint.js.map