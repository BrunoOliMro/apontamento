"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const stopPost = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let numeroOdf = String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"])) || null;
    let funcionario = String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO'])) || null;
    let codigoPeca = String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA'])) || null;
    let revisao = Number((0, sanitize_html_1.default)(req.cookies['REVISAO'])) || 0;
    let numeroOperacao = String(req.cookies['NUMERO_OPERACAO']) || null;
    let codigoMaq = String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA'])) || null;
    let qtdLibMax = Number((0, sanitize_html_1.default)(req.cookies['qtdLibMax'])) || 0;
    let end = new Date().getTime() || 0;
    let start = Number(req.cookies["starterBarcode"]) || 0;
    let newStart = Number(new Date(start).getTime()) || 0;
    let final = Number(end - newStart) || 0;
    try {
        const resour = await connection.query(`
            INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , '${numeroOperacao}' ,'${numeroOperacao}', 'D', '${codigoMaq}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '5' , '5', 'Parada.' , '${final}' , '${final}' , '1' ,'0','0')`).then(record => record.rowsAffected);
        if (resour.length <= 0) {
            return res.json({ message: 'erro ao parar a maquina' });
        }
        else {
            return res.status(200).json({ message: 'maquina parada com sucesso' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "ocorre um erro ao tentar parar a maquina" });
    }
    finally {
        await connection.close();
    }
};
exports.stopPost = stopPost;
//# sourceMappingURL=stopPost.js.map