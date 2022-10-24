"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const pictures_1 = require("../pictures");
const tools = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let codigoPeca = String(req.cookies["CODIGO_PECA"]);
    let numero_odf = String(req.cookies["NUMERO_ODF"]);
    let numeroOperacao = String(req.cookies["NUMERO_OPERACAO"]);
    let codigoMaq = String(req.cookies["CODIGO_MAQUINA"]);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let revisao = Number(req.cookies['REVISAO']);
    let ferramenta = String("_ferr");
    let start = String(req.cookies["starterBarcode"]);
    let qtdLibMax = Number(req.cookies['qtdLibMax']);
    let startTime = Number(new Date(start).getTime());
    try {
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
        const query = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '1', '1', 'Ini Set.', ${startTime}, ${startTime}, '1', '0', '0' )`).then(record => record.recordsets);
        console.log("query linha 515: ", query);
        if (query === undefined) {
            return res.json({ message: "Erro nas ferramentas." });
        }
        else {
            return res.status(200).json(result);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
    }
};
exports.tools = tools;
//# sourceMappingURL=tools.js.map