"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const update_1 = require("../services/update");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const ripPost = async (req, res) => {
    let setup = (req.body['setup']) || null;
    let keySan;
    let valueSan;
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let NUMERO_ODF = (0, decryptedOdf_1.decrypted)(String((req.cookies['NUMERO_ODF']))) || null;
    let NUMERO_OPERACAO = (0, decryptedOdf_1.decrypted)(String(req.cookies['NUMERO_OPERACAO'])) || null;
    let CODIGO_MAQUINA = (0, decryptedOdf_1.decrypted)(String((req.cookies['CODIGO_MAQUINA']))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((req.cookies['CODIGO_PECA']))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((req.cookies['employee']))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((req.cookies['REVISAO']))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((req.cookies['qtdLibMax']))) || null;
    const updateQtyQuery = [];
    let especif = (req.cookies['especif']) || null;
    let numCar = (req.cookies['numCar']) || null;
    let lie = (req.cookies['lie']) || null;
    let lse = (req.cookies['lse']) || null;
    let instrumento = (req.cookies['instrumento']) || null;
    let descricao = (req.cookies['descricao']) || null;
    var objectSanitized = {};
    console.log("linha 31 /rip Post/", setup);
    const startRip = Number(req.cookies["startRip"]) || 0;
    const endProdRip = Number(new Date().getDate()) || 0;
    const tempoDecorridoRip = Number(new Date(startRip).getDate()) || 0;
    const finalProdRip = Number(tempoDecorridoRip - endProdRip) || 0;
    if (!setup) {
        if (Object.keys(setup).length <= 0) {
            return res.json({ message: "rip vazia" });
        }
        for (const [key, value] of Object.entries(setup)) {
            keySan = (0, sanitize_1.sanitize)(key);
            valueSan = (0, sanitize_1.sanitize)(value);
            objectSanitized[keySan] = valueSan;
        }
    }
    NUMERO_ODF = Number(NUMERO_ODF);
    qtdLibMax = Number(qtdLibMax);
    let boas = 0;
    let ruins = 0;
    let codAponta = 6;
    let descricaoCodAponta = 'Rip Fin';
    let motivo = '';
    let faltante = 0;
    let retrabalhada = 0;
    await (0, insert_1.insertInto)(funcionario, NUMERO_ODF, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorridoRip);
    try {
        const updatePcpProg = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`;
        await (0, update_1.update)(updatePcpProg);
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'ocorreu um erro ao enviar os dados da rip' });
    }
    const resultSplitLines = Object.keys(objectSanitized).reduce((acc, iterator) => {
        const [col, lin] = iterator.split("-");
        if (acc[lin] === undefined)
            acc[lin] = {};
        acc[lin][col] = objectSanitized[iterator];
        return acc;
    }, {});
    try {
        Object.entries(resultSplitLines).forEach(([row], i) => {
            if (resultSplitLines[row].SETUP === "ok" && lie[i] === null && lse[i] === null) {
                resultSplitLines[row] = 0;
            }
            updateQtyQuery.push(`
            INSERT INTO
                CST_RIP_ODF_PRODUCAO 
                    (ODF, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                VALUES('${NUMERO_ODF}','1', '${revisao}' , '${numCar[i]}', '${descricao[i]}',  '${especif[i]}',${lie[i]}, ${lse[i]},${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `${resultSplitLines[row].M2}` : null},${resultSplitLines[row].M3 ? `${resultSplitLines[row].M3}` : null},${resultSplitLines[row].M4 ? `${resultSplitLines[row].M4}` : null},${resultSplitLines[row].M5 ? `${resultSplitLines[row].M5}` : null},${resultSplitLines[row].M6 ? `${resultSplitLines[row].M6}` : null},${resultSplitLines[row].M7 ? `${resultSplitLines[row].M7}` : null},${resultSplitLines[row].M8 ? `${resultSplitLines[row].M8}` : null},${resultSplitLines[row].M9 ? `${resultSplitLines[row].M9}` : null},${resultSplitLines[row].M10 ? `${resultSplitLines[row].M10}` : null},${resultSplitLines[row].M11 ? `${resultSplitLines[row].M11}` : null},${resultSplitLines[row].M12 ? `${resultSplitLines[row].M12}` : null},${resultSplitLines[row].M13 ? `${resultSplitLines[row].M13}` : null},'${instrumento[i]}','${CODIGO_MAQUINA}','${NUMERO_OPERACAO}')`);
        });
        await connection.query(updateQtyQuery.join("\n"));
        let response = {
            message: "rip enviada, odf finalizada",
            url: '/#/codigobarras'
        };
        return res.json(response);
    }
    catch (error) {
        console.log("linha 75 /ripPost/", error);
        return res.json({ message: "ocorreu um erro ao enviar os dados da rip" });
    }
};
exports.ripPost = ripPost;
//# sourceMappingURL=ripPost.js.map