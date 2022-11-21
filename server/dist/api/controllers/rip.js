"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rip = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const rip = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["CODIGO_PECA"]))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['REVISAO']))) || null;
    let codMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["CODIGO_PECA"]))) || null;
    let numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"]))) || null;
    let numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_OPERACAO"]))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO']))) || null;
    let start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["starterBarcode"]))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['qtdLibMax']))) || null;
    let startTime = Number(new Date(start).getTime()) || 0;
    try {
        const ripDetails = await connection.query(`
        SELECT  DISTINCT
        PROCESSO.NUMPEC,
        PROCESSO.REVISAO,
        QA_CARACTERISTICA.NUMCAR AS NUMCAR,
        QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE,
        QA_CARACTERISTICA.DESCRICAO,
        ESPECIFICACAO  AS ESPECIF,
        LIE,
        LSE,
        QA_CARACTERISTICA.INSTRUMENTO
        FROM PROCESSO
        INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO
        INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC
        AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA 
        AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO 
        LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA  
        FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE
        WHERE PROCESSO.NUMPEC = '${numpec}' 
        AND PROCESSO.REVISAO = '${revisao}' 
        AND NUMCAR < '2999'
        ORDER BY NUMPEC ASC
            `.trim()).then(result => result.recordset);
        let arrayNumope = ripDetails.map((acc) => {
            if (acc.CST_NUMOPE === codMaq) {
                return acc;
            }
        });
        console.log("linha 53 /rip/", arrayNumope);
        let numopeFilter = arrayNumope.filter(acc => acc);
        res.cookie('cstNumope', numopeFilter.map(acc => acc.CST_NUMOPE));
        res.cookie('numCar', numopeFilter.map(acc => acc.NUMCAR));
        res.cookie('descricao', numopeFilter.map(acc => acc.DESCRICAO));
        res.cookie('especif', numopeFilter.map(acc => acc.ESPECIF));
        res.cookie('instrumento', numopeFilter.map(acc => acc.INSTRUMENTO));
        res.cookie('lie', numopeFilter.map(acc => acc.LIE));
        res.cookie('lse', numopeFilter.map(acc => acc.LSE));
        let descricaoCodAponta = `Rip Ini`;
        let boas = 0;
        let ruins = 0;
        let faltante = 0;
        let retrabalhada = 0;
        let codAponta = 5;
        let motivo = ``;
        try {
            await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, startTime);
        }
        catch (error) {
            return res.json({ message: 'Erro ao iniciar tempo da rip' });
        }
        if (numopeFilter.length <= 0) {
        }
        return res.json(numopeFilter);
    }
    catch (error) {
        console.log(error);
        return res.redirect("/#/codigobarras/apontamento?error=ripnotFound");
    }
    finally {
    }
};
exports.rip = rip;
//# sourceMappingURL=rip.js.map