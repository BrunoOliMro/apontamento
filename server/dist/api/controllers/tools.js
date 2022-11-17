"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedTools = exports.tools = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const pictures_1 = require("../pictures");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const tools = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    let numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    let numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
    let codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    let start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["starterBarcode"]))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['qtdLibMax']))) || null;
    let startTime;
    startTime = Number(start);
    let ferramenta = String("_ferr");
    try {
        const toolsImg = await connection.query(`
            SELECT
                [CODIGO],
                [IMAGEM]
            FROM VIEW_APTO_FERRAMENTAL 
            WHERE 1 = 1 
                AND IMAGEM IS NOT NULL
                AND CODIGO = '${codigoPeca}'
        `).then(res => res.recordset);
        let result = [];
        for await (let [i, record] of toolsImg.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }
        const verifyInsert = await connection.query(`SELECT * FROM HISAPONTA WHERE 1 = 1 AND ODF = '${numeroOdf}' AND NUMOPE = '${numeroOperacao}' AND ITEM = '${codigoMaq}' ORDER BY CODAPONTA DESC
        `).then(record => record.rowsAffected);
        if (verifyInsert.length <= 0) {
            try {
                await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
                VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, 0, 0, '${funcionario}', '0', '1', '1', 'Ini Set.', ${startTime}, ${startTime}, '1', 0, 0 )`).then(record => record.rowsAffected);
            }
            catch (error) {
                console.log(error);
                return res.json({ message: "Erro ao inserir codapontamento 1" });
            }
        }
        if (toolsImg.length <= 0) {
            return res.json({ message: "/images/sem_imagem.gif" });
        }
        if (toolsImg.length > 0) {
            res.cookie('tools', 'true');
            return res.json(result);
        }
        else {
            return res.json({ message: 'Erro ao tentar acessar as fotos de ferramentas' });
        }
    }
    catch (error) {
        return res.json({ error: true, message: "Erro ao tentar acessar as fotos de ferramentas" });
    }
    finally {
    }
};
exports.tools = tools;
const selectedTools = async (req, res) => {
    const numero_odf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF']))) || null;
    const numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
    const codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['qtdLibMax']))) || null;
    const start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['starterBarcode']))) || null;
    const end = Number(new Date().getTime()) || 0;
    let startTime;
    startTime = Number(start);
    const tempoDecorrido = Number(end - startTime) || 0;
    const startProd = Number(new Date().getTime()) || 0;
    res.cookie("startProd", startProd);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', ${numero_odf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '2', '2', 'Fin Set.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record);
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', ${numero_odf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '3', '3', 'Ini Prod.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record);
        return res.json({ message: 'ferramentas selecionadas com successo' });
    }
    catch (error) {
        console.log('linha 104 /selected Tools/: ', error);
        return res.redirect("/#/ferramenta");
    }
    finally {
    }
};
exports.selectedTools = selectedTools;
//# sourceMappingURL=tools.js.map