"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const sanitize_1 = require("../utils/sanitize");
const ripPost = async (req, res) => {
    let setup = (req.body['setup']) || null;
    let keySan;
    let valueSan;
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let NUMERO_ODF = Number((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])) || 0;
    let NUMERO_OPERACAO = String(req.cookies['NUMERO_OPERACAO']) || null;
    let CODIGO_MAQUINA = String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])) || null;
    let codigoPeca = String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])) || null;
    let funcionario = String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])) || null;
    let revisao = Number((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || 0;
    let qtdLibMax = Number((0, sanitize_1.sanitize)(req.cookies['qtdLibMax'])) || 0;
    const updateQtyQuery = [];
    let especif = (req.cookies['especif']) || null;
    let numCar = (req.cookies['numCar']) || null;
    let lie = (req.cookies['lie']) || null;
    let lse = (req.cookies['lse']) || null;
    let instrumento = (req.cookies['instrumento']) || null;
    let descricao = (req.cookies['descricao']) || null;
    var objectSanitized = {};
    const startRip = Number(req.cookies["startRip"]) || 0;
    const endProdRip = Number(new Date().getDate()) || 0;
    const tempoDecorridoRip = Number(new Date(startRip).getDate()) || 0;
    const finalProdRip = Number(tempoDecorridoRip - endProdRip) || 0;
    if (Object.keys(setup).length <= 0) {
        return res.json({ message: "rip vazia" });
    }
    for (const [key, value] of Object.entries(setup)) {
        keySan = (0, sanitize_1.sanitize)(key);
        valueSan = (0, sanitize_1.sanitize)(value);
        objectSanitized[keySan] = valueSan;
    }
    await connection.query(`
    INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
    VALUES(GETDATE(), '${funcionario}', ${NUMERO_ODF}, '${codigoPeca}', ${revisao}, '${NUMERO_OPERACAO}', '${NUMERO_OPERACAO}', 'D', '${CODIGO_MAQUINA}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '6', '6', 'ODF ENC.', ${finalProdRip}, ${finalProdRip}, '1', '0', '0')`);
    try {
        await connection.query(`
                UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
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
            updateQtyQuery.push(`
            INSERT INTO 
                CST_RIP_ODF_PRODUCAO 
                    (ODF, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                VALUES('${NUMERO_ODF}','1', '${revisao}' , '${numCar[i]}', '${descricao[i]}',  '${especif[i]}','${lie[i]}', '${lse[i]}',${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `'${resultSplitLines[row].M2}'` : null},${resultSplitLines[row].M3 ? `'${resultSplitLines[row].M3}'` : null},${resultSplitLines[row].M4 ? `'${resultSplitLines[row].M4}'` : null},${resultSplitLines[row].M5 ? `'${resultSplitLines[row].M5}'` : null},${resultSplitLines[row].M6 ? `'${resultSplitLines[row].M6}'` : null},${resultSplitLines[row].M7 ? `'${resultSplitLines[row].M7}'` : null},${resultSplitLines[row].M8 ? `'${resultSplitLines[row].M8}'` : null},${resultSplitLines[row].M9 ? `'${resultSplitLines[row].M9}'` : null},${resultSplitLines[row].M10 ? `'${resultSplitLines[row].M10}'` : null},${resultSplitLines[row].M11 ? `'${resultSplitLines[row].M11}'` : null},${resultSplitLines[row].M12 ? `'${resultSplitLines[row].M12}'` : null},${resultSplitLines[row].M13 ? `'${resultSplitLines[row].M13}'` : null},'${instrumento[i]}','${CODIGO_MAQUINA}','${NUMERO_OPERACAO}')`);
        });
        await connection.query(updateQtyQuery.join("\n"));
        return res.json({ message: "rip enviada, odf finalizada" });
    }
    catch (error) {
        console.log("linha 75 /ripPost/", error);
        return res.json({ message: "ocorreu um erro ao enviar os dados da rip" });
    }
};
exports.ripPost = ripPost;
//# sourceMappingURL=ripPost.js.map