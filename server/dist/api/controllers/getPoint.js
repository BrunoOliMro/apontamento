"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoint = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const select_1 = require("../services/select");
const selectAddress_1 = require("../services/selectAddress");
const update_1 = require("../services/update");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const getPoint = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let NUMERO_ODF = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"]))) || null;
    let qtdBoas = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["qtdBoas"]))) || null;
    const NUMERO_OPERACAO = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['NUMERO_OPERACAO']))) || null;
    const CODIGO_MAQUINA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA']))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO']))) || null;
    const updateQuery = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${codigoPeca}'`;
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
    console.log("linha 39", NUMERO_OPERACAO);
    try {
        if (NUMERO_OPERACAO === "00999") {
            let addressValues;
            if (CODIGO_MAQUINA !== 'EX002') {
                addressValues = await (0, selectAddress_1.selectAddress)(codigoPeca, 5);
                addressValues = await (0, selectAddress_1.selectAddress)(codigoPeca, 7);
                console.log("linha 48 /getPoint/", addressValues);
                const add = (addressValues.map((callback) => callback.QUANTIDADE));
                const ç = (addressValues.map((callback) => callback.QUANTIDADE));
                var choice;
                var resChoice;
                if (add.length > 0) {
                    obj = addressValues;
                    choice = add;
                    resChoice = add;
                }
                else if (ç.length > 0) {
                    obj = addressValues;
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
                addressValues = await (0, selectAddress_1.selectAddress)(codigoPeca, 7);
                addressValues = await (0, selectAddress_1.selectAddress)(codigoPeca, 7);
                console.log("linha 96 /getPoint/", addressValues);
                const add = (addressValues.map((callback) => callback.QUANTIDADE));
                const ç = (addressValues.map((callback) => callback.QUANTIDADE));
                var choice;
                var resChoice;
                if (add.length > 0) {
                    obj = addressValues;
                    choice = add;
                    resChoice = addressValues;
                }
                else if (ç.length > 0) {
                    obj = addressValues;
                    choice = ç;
                    resChoice = addressValues;
                }
                let smallerNumber = Math.min(...choice);
                let indiceDoArrayDeOdfs = choice.findIndex((callback) => callback === smallerNumber);
                address = resChoice[indiceDoArrayDeOdfs].ENDERECO;
            }
            try {
                const lookForHisReal = `SELECT TOP 1  * FROM HISREAL  WHERE 1 = 1 AND CODIGO = '${codigoPeca}' ORDER BY DATA DESC`;
                const resultQuery = await (0, select_1.select)(lookForHisReal);
                try {
                    const insertHisReal = await connection.query(`
                INSERT INTO HISREAL
                    (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
                SELECT 
                    CODIGO, '${NUMERO_ODF}/${codigoPeca}', GETDATE(), ${qtdBoas}, 0 , 'E', ${resultQuery[0].SALDO} + ${qtdBoas}, GETDATE(), '0', '${funcionario}', '${NUMERO_ODF}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
                FROM ESTOQUE(NOLOCK)
                WHERE 1 = 1 
                AND CODIGO = '${codigoPeca}' 
                GROUP BY CODIGO`).then(result => result.rowsAffected);
                    console.log("LINHA 106", insertHisReal);
                }
                catch (error) {
                    console.log('linha 103', error);
                    return res.json({ message: 'erro inserir em hisreal' });
                }
                console.log("linha 160 /getPoint/", NUMERO_OPERACAO);
                try {
                    console.log("linha 144 /getPoint/");
                    if (NUMERO_OPERACAO === "00999") {
                        const x = await (0, update_1.update)(updateQuery);
                        console.log("linha 146 /getPoint/", x);
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