"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedTools = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const selectedTools = async (req, res) => {
    let numero_odf = String(req.cookies['NUMERO_ODF']);
    let numeroOperacao = String(req.cookies['NUMERO_OPERACAO']);
    let codigoMaq = String(req.cookies['CODIGO_MAQUINA']);
    let codigoPeca = String(req.cookies["CODIGO_PECA"]);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let revisao = Number(req.cookies['REVISAO']);
    let qtdLibMax = Number(req.cookies['qtdLibMax']);
    let end = Number(new Date().getTime());
    let start = String(req.cookies['starterBarcode']);
    const startTime = Number(new Date(start).getTime());
    let tempoDecorrido = Number(end - startTime);
    let startProd = new Date().getTime();
    res.cookie("startProd", startProd);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const query = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '2', '2', 'Fin Set.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.rowsAffected);
        console.log("query linha 572 : ", query);
        const InsertCodTwo = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
        VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '3', '3', 'Ini Prod.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.rowsAffected);
        console.log("InsertCodTwo linha 577 : ", InsertCodTwo);
        if (!query) {
            return res.json({ message: "erro em ferselecionadas" });
        }
        else {
            return res.status(200).json({ message: 'ferramentas selecionadas com successo' });
        }
    }
    catch (error) {
        console.log(error);
        return res.redirect("/#/ferramenta");
    }
    finally {
    }
};
exports.selectedTools = selectedTools;
//# sourceMappingURL=selectedTools.js.map