"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rip = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const rip = async (req, res) => {
    const numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["CODIGO_PECA"]))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['REVISAO']))) || null;
    const codMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    console.log('linha codmaqs', codMaq);
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["CODIGO_PECA"]))) || null;
    const numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"]))) || null;
    const numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_OPERACAO"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['employee']))) || null;
    const start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["startSetupTime"]))) || null;
    const qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['quantidade']))) || null;
    const startTime = Number(new Date(start).getTime()) || 0;
    const response = {
        message: '',
        url: '',
        object: '',
    };
    const rip = `
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
        AND CST_NUMOPE = '${codMaq}'
        AND NUMCAR < '2999'
        ORDER BY NUMPEC ASC`;
    const ripDetails = await (0, select_1.select)(rip);
    console.log("linha ripDetaisl", ripDetails);
    if (ripDetails.length <= 0) {
        console.log("iewniureb");
        response.message = 'Não há rip a mostrar';
        response.url = '/#/codigobarras';
        return res.json(response);
    }
    let arrayNumope = ripDetails.map((acc) => {
        if (acc.CST_NUMOPE === codMaq) {
            return acc;
        }
        else {
            return acc;
        }
    });
    let numopeFilter = arrayNumope.filter((acc) => acc);
    res.cookie('cstNumope', numopeFilter.map((acc) => acc.CST_NUMOPE));
    res.cookie('numCar', numopeFilter.map((acc) => acc.NUMCAR));
    res.cookie('descricao', numopeFilter.map((acc) => acc.DESCRICAO));
    res.cookie('especif', numopeFilter.map((acc) => acc.ESPECIF));
    res.cookie('instrumento', numopeFilter.map((acc) => acc.INSTRUMENTO));
    res.cookie('lie', numopeFilter.map((acc) => acc.LIE));
    res.cookie('lse', numopeFilter.map((acc) => acc.LSE));
    const descricaoCodAponta = `Rip Ini`;
    const boas = 0;
    const ruins = 0;
    const faltante = 0;
    const retrabalhada = 0;
    const codAponta = 5;
    const motivo = ``;
    try {
        const inserted = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, startTime);
        if (inserted === 'insert done') {
            return res.json(numopeFilter);
        }
        else if (inserted === 'Algo deu errado') {
            return response.message = 'Algo deu errado';
        }
        else {
            return response.message = 'Algo deu errado';
        }
    }
    catch (error) {
        response.url = '/#/codigobarras/';
        response.message = 'Erro ao iniciar tempo da rip';
        return res.json(response);
    }
};
exports.rip = rip;
//# sourceMappingURL=rip.js.map