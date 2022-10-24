"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopMotives = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const stopMotives = async (_req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT CODIGO,DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
        let resoc = resource.map(e => e.DESCRICAO);
        if (!resource) {
            return res.json({ message: 'erro motivos de parada de maquina' });
        }
        else {
            return res.status(200).json(resoc);
        }
    }
    catch (error) {
        return res.json({ message: 'erro motivos de parada de maquina' });
    }
    finally {
    }
};
exports.stopMotives = stopMotives;
//# sourceMappingURL=stopMotives.js.map