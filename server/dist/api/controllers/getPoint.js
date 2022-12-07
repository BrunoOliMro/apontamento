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
    let NUMERO_OPERACAO = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['NUMERO_OPERACAO']))) || null;
    const CODIGO_MAQUINA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA']))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO']))) || null;
    let qtdProduzir = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['QTDE_LIB']))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['REVISAO']))) || null;
    console.log("linha 20 /revisao/", revisao);
    const updateQuery = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${codigoPeca}'`;
    var address;
    var response = {
        message: '',
        address: '',
        url: '',
    };
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
    NUMERO_OPERACAO = "00" + NUMERO_OPERACAO.replaceAll(" ", '0');
    console.log("linha 46 /NUMERO_OPERACAO/", NUMERO_OPERACAO);
    try {
        if (NUMERO_OPERACAO === "00999") {
            let numeroOp = NUMERO_OPERACAO.replaceAll('0', '');
            let y = `SELECT TOP 1 * FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${codigoPeca}' AND NUMOPE = '${numeroOp}' AND REVISAO = ${revisao}`;
            const x = await (0, select_1.select)(y);
            console.log("linha 52", x[0].EXECUT);
            console.log("linha 52", x[0].COMPRIMENTO);
            console.log("linha 52", x[0].LARGURA);
            let pesoUnidade = x[0].EXECUT;
            let comprimento = x[0].COMPRIMENTO;
            let largura = x[0].LARGURA;
            let areaCubicaMax = 36000000;
            let areaMax = 800;
            let pesoMax = 25;
            let peso = pesoUnidade * qtdProduzir;
            console.log("linha 60 /getPoint.ts/", peso);
            if (peso < pesoMax) {
                console.log("Passou no primeiro teste ...");
            }
            let area = comprimento + largura;
            if (area <= areaMax) {
                console.log("passou no segundo teste ...");
            }
            let areaCubica = comprimento * largura * qtdProduzir;
            if (areaCubica < areaCubicaMax) {
                console.log("passou no terceiro teste ...");
            }
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
                let fisrtReqAddress = fisrtSelectAddress.map((callback) => callback.QUANTIDADE);
                let secondReqAddress = secondSelectAddress.map((callback) => callback.QUANTIDADE);
                let smallerNumber = Math.min(...fisrtReqAddress);
                let small = Math.min(...secondReqAddress);
                let indiceDoArrayDeOdfs = fisrtReqAddress.findIndex((callback) => callback === smallerNumber);
                let indice = secondReqAddress.findIndex((callback) => callback === small);
                if (secondSelectAddress.length <= 0) {
                    response.message = 'Address located';
                    response.address = fisrtSelectAddress[indiceDoArrayDeOdfs].ENDERECO;
                }
                if (fisrtSelectAddress.length <= 0) {
                    response.message = 'Address located';
                    response.address = secondSelectAddress[indice].ENDERECO;
                }
            }
            if (CODIGO_MAQUINA === 'EX002') {
                console.log("linha 119 /getPoint.ts/", codigoPeca);
                let condicional = `= '${codigoPeca}'`;
                let condicional2 = `IS NULL`;
                let fisrtSelectAddress = await (0, selectAddress_1.selectAddress)(condicional, 7);
                let secondSelectAddress;
                if (fisrtSelectAddress === 'odf nao encontrada') {
                    console.log("linha 124 /getPoint.ts/");
                    fisrtSelectAddress = [];
                    secondSelectAddress = await (0, selectAddress_1.selectAddress)(condicional2, 7);
                    console.log("linha 129 ", secondSelectAddress);
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
                const fisrtAdd = fisrtSelectAddress.map((callback) => callback.QUANTIDADE);
                const secondAdd = secondSelectAddress.map((callback) => callback.QUANTIDADE);
                let smallerNumber = Math.min(...fisrtAdd);
                let small = Math.min(...secondAdd);
                let indiceDoArrayDeOdfs = fisrtAdd.findIndex((callback) => callback === smallerNumber);
                let indice = secondAdd.findIndex((callback) => callback === small);
                if (secondSelectAddress.length <= 0) {
                    response.message = 'Address located';
                    response.address = fisrtSelectAddress[indiceDoArrayDeOdfs].ENDERECO;
                }
                if (fisrtSelectAddress.length <= 0) {
                    response.message = 'Address located';
                    response.address = secondSelectAddress[indice].ENDERECO;
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
                try {
                    let updateStorage;
                    if (NUMERO_OPERACAO === "00999") {
                        updateStorage = await (0, update_1.update)(updateQuery);
                    }
                    console.log("linha 197 /getPoint.ts/", updateStorage);
                    if (updateStorage === 'Update sucess' && address === 'No address') {
                        console.log("linha 201");
                        return res.json({ message: 'No address' });
                    }
                    if (!response.address) {
                        console.log("linha 210 /getPoint.ts/ ");
                        response.message = 'No address';
                        return res.json({ response });
                    }
                    else {
                        console.log("linha 214 /getPoint.ts/ ");
                        return res.json(response);
                    }
                }
                catch (error) {
                    console.log(error);
                    return res.json({ message: 'Error on updating storage' });
                }
            }
            catch (error) {
                console.log(error);
                return res.json({ message: 'Error on locating space' });
            }
        }
        else {
            response.url = '/#/rip';
            response.message = 'No address';
            return res.json(response);
        }
    }
    catch (error) {
        console.log('linha 185', error);
        return res.json({ message: 'Error on locating space' });
    }
};
exports.getPoint = getPoint;
//# sourceMappingURL=getPoint.js.map