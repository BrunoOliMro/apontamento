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
    let qtdProduzir = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['qtdProduzir']))) || null;
    const updateQuery = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${codigoPeca}'`;
    var address;
    const hostname = req.get("host");
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};
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
        console.log("linha 38 /getPoint /", NUMERO_OPERACAO);
        if (NUMERO_OPERACAO === "00999") {
            if (CODIGO_MAQUINA !== 'EX002') {
                let condicional = `= '${codigoPeca}'`;
                let condicional2 = `IS NULL`;
                let fisrtSelectAddress = await (0, selectAddress_1.selectAddress)(condicional, 5);
                let secondSelectAddress;
                if (fisrtSelectAddress === 'odf nao encontrada') {
                    fisrtSelectAddress = [];
                    secondSelectAddress = await (0, selectAddress_1.selectAddress)(condicional2, 5);
                }
                if (!secondSelectAddress || secondSelectAddress === 'odf nao encontrada') {
                    secondSelectAddress = [];
                }
                console.log('LINHA 66', fisrtSelectAddress);
                console.log("linha 67", secondSelectAddress);
                let fisrtReqAddress = fisrtSelectAddress.map((callback) => callback.QUANTIDADE);
                let secondReqAddress = secondSelectAddress.map((callback) => callback.QUANTIDADE);
                let smallerNumber = Math.min(...fisrtReqAddress);
                let small = Math.min(...secondReqAddress);
                let indiceDoArrayDeOdfs = fisrtReqAddress.findIndex((callback) => callback === smallerNumber);
                let indice = secondReqAddress.findIndex((callback) => callback === small);
                console.log("linha 73", codigoPeca);
                let y = `SELECT TOP 1 CONDIC, EXECUT, COMPRIMENTO, LARGURA FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${codigoPeca}' AND CONDIC = 'M'`;
                const x = await (0, select_1.select)(y);
                let pesoUnidade = x[0].EXECUT;
                let comprimento = x[0].COMPRIMENTO;
                let largura = x[0].LARGURA;
                let areaCubicaMax = 36000000;
                let areaMax = 800;
                let pesoMax = 25;
                console.log('linha pesoUnidade', pesoUnidade);
                console.log('linnha comprimento', comprimento);
                console.log("linha largura", largura);
                let peso = pesoUnidade * qtdProduzir;
                if (peso < pesoMax) {
                    console.log("Passou no primeiro teste de estoque ...");
                }
                let area = comprimento + largura;
                console.log('linha 90', area);
                if (area <= areaMax) {
                    console.log("passou no segundo teste ...");
                }
                let areaCubica = comprimento * largura * qtdProduzir;
                console.log("linha 96", areaCubica);
                if (areaCubica < areaCubicaMax) {
                    console.log("passou no terceiro teste ...");
                }
                let addressToStorage = {};
                if (secondSelectAddress.length <= 0) {
                    addressToStorage = {
                        message: 'endereço com sucesso',
                        address: fisrtSelectAddress[indiceDoArrayDeOdfs].ENDERECO,
                    };
                    return res.json(addressToStorage);
                }
                if (fisrtSelectAddress.length <= 0) {
                    addressToStorage = {
                        message: 'endereço com sucesso',
                        address: secondSelectAddress[indice].ENDERECO
                    };
                    return res.json(addressToStorage);
                }
                else {
                    console.log('redirecionando para rip...');
                    return res.redirect('/#/rip');
                }
            }
            if (CODIGO_MAQUINA === 'EX002') {
                let fisrtSelectAddress = await (0, selectAddress_1.selectAddress)(codigoPeca, 7);
                let secondSelectAddress;
                if (!fisrtSelectAddress) {
                    fisrtSelectAddress = [];
                    secondSelectAddress = await (0, selectAddress_1.selectAddress)(codigoPeca, 7);
                }
                if (!secondSelectAddress) {
                    secondSelectAddress = [];
                }
                if (typeof (secondSelectAddress) === 'string') {
                    secondSelectAddress = [];
                }
                if (typeof (secondSelectAddress) === 'string') {
                    fisrtSelectAddress = [];
                }
                console.log('LINHA 112', fisrtSelectAddress);
                const fisrtAdd = fisrtSelectAddress.map((callback) => callback.QUANTIDADE);
                const secondAdd = secondSelectAddress.map((callback) => callback.QUANTIDADE);
                let smallerNumber = Math.min(...fisrtAdd);
                let small = Math.min(...secondAdd);
                let indiceDoArrayDeOdfs = fisrtAdd.findIndex((callback) => callback === smallerNumber);
                let indice = secondAdd.findIndex((callback) => callback === small);
                let addressToStorage;
                if (secondSelectAddress.length <= 0) {
                    addressToStorage = {
                        message: 'endereço com sucesso',
                        address: fisrtSelectAddress[indiceDoArrayDeOdfs].ENDERECO,
                    };
                    return res.json(addressToStorage);
                }
                if (fisrtSelectAddress.length <= 0) {
                    addressToStorage = {
                        message: 'endereço com sucesso',
                        addresss: secondSelectAddress[indice].ENDERECO
                    };
                    return res.json(addressToStorage);
                }
                else {
                    return res.json({ message: 'sem endereço' });
                }
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
                    console.log("LINHA 149", insertHisReal);
                }
                catch (error) {
                    console.log('linha 151', error);
                    return res.json({ message: 'erro inserir em hisreal' });
                }
                console.log("linha 155 /getPoint/", NUMERO_OPERACAO);
                try {
                    console.log("linha 157 /getPoint/");
                    if (NUMERO_OPERACAO === "00999") {
                        const x = await (0, update_1.update)(updateQuery);
                        console.log("linha 146 /getPoint/", x);
                    }
                    let objRes = {
                        address: address,
                        message: 'endereço com sucesso'
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
        console.log('linha 185', error);
        return res.json({ message: 'erro ao localizar os dados em hisreal' });
    }
};
exports.getPoint = getPoint;
//# sourceMappingURL=getPoint.js.map