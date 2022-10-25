"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedTools = exports.tools = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const pictures_1 = require("../pictures");
const sanitize_1 = require("../utils/sanitize");
const tools = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let codigoPeca = String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"])) || null;
    let numero_odf = Number((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])) || 0;
    let numeroOperacao = String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"])) || null;
    let codigoMaq = String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"])) || null;
    let funcionario = String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])) || null;
    let revisao = Number((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || 0;
    let ferramenta = String("_ferr");
    let start = Number((0, sanitize_1.sanitize)(req.cookies["starterBarcode"])) || 0;
    let qtdLibMax = Number((0, sanitize_1.sanitize)(req.cookies['qtdLibMax'])) || 0;
    let startTime = Number(new Date(start).getTime()) || 0;
    let state = 0;
    try {
        state = 0;
        const resource = await connection.query(`
            SELECT
                [CODIGO],
                [IMAGEM]
            FROM VIEW_APTO_FERRAMENTAL 
            WHERE 1 = 1 
                AND IMAGEM IS NOT NULL
                AND CODIGO = '${codigoPeca}'
        `).then(res => res.recordset);
        let result = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }
        console.log('res: linha 37 ', resource);
        state = 1;
        try {
            await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
            VALUES (GETDATE(), '${funcionario}', ${numero_odf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, 0, 0, '${funcionario}', '0', '1', '1', 'Ini Set.', ${startTime}, ${startTime}, '1', 0, 0 )`).then(record => record.recordsets);
        }
        catch (error) {
            console.log(error);
        }
        state = 2;
        return res.status(200).json(result);
    }
    catch (error) {
        state = 0;
        console.log('linha 57 /tools /', error);
        return res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
    }
    res;
};
exports.tools = tools;
const selectedTools = async (req, res) => {
    const numero_odf = String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])) || null;
    const numeroOperacao = String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO'])) || null;
    const codigoMaq = String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])) || null;
    const codigoPeca = String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"])) || null;
    const funcionario = String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])) || null;
    const revisao = Number((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || 0;
    const qtdLibMax = Number((0, sanitize_1.sanitize)(req.cookies['qtdLibMax'])) || 0;
    let state = 0;
    const end = Number(new Date().getTime()) || 0;
    const start = Number(req.cookies['starterBarcode']) || 0;
    const startTime = Number(new Date(start).getTime()) || 0;
    const tempoDecorrido = Number(end - startTime) || 0;
    const startProd = Number(new Date().getTime()) || 0;
    res.cookie("startProd", startProd);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        state = 1;
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', ${numero_odf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '2', '2', 'Fin Set.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.recordset);
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', ${numero_odf}, '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '3', '3', 'Ini Prod.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.recordset);
        state = 2;
        return res.status(200).json({ message: 'ferramentas selecionadas com successo' });
    }
    catch (error) {
        state = 1;
        console.log('linha 104: ', error);
        return res.redirect("/#/ferramenta");
    }
    finally {
    }
};
exports.selectedTools = selectedTools;
//# sourceMappingURL=tools.js.map