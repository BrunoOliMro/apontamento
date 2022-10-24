"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSupervisor = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const stopSupervisor = async (req, res) => {
    let supervisor = String(req.body['supervisor']);
    let numeroOdf = String(req.cookies['NUMERO_ODF']);
    let NUMERO_OPERACAO = String(req.cookies['NUMERO_OPERACAO']);
    let CODIGO_MAQUINA = String(req.cookies['CODIGO_MAQUINA']);
    let qtdLibMax = String(req.cookies['qtdLibMax']);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let revisao = Number(req.cookies['REVISAO']) || 0;
    let codigoPeca = String(req.cookies['CODIGO_PECA']);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
        if (resource.length > 0) {
            await connection.query(`
            INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${NUMERO_OPERACAO} ,${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '3' , '3', 'Fin Prod.' , '0' , '0' , '1' ,'0','0')`);
            return res.status(200).json({ success: 'maquina' });
        }
        else {
            return res.json({ message: "erro na parada de maquina" });
        }
    }
    catch (error) {
        return res.json({ message: "erro na parada de maquina" });
    }
    finally {
    }
};
exports.stopSupervisor = stopSupervisor;
//# sourceMappingURL=stopSupervisor.js.map