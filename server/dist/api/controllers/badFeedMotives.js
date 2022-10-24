"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.badFeedMotives = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const badFeedMotives = async (_req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
        SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
        let resoc = resource.map(e => e.DESCRICAO);
        if (resource.length > 0) {
            return res.status(200).json(resoc);
        }
        else {
            return res.json({ message: 'erro em motivos do refugo' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro em motivos de refugo' });
    }
    finally {
    }
};
exports.badFeedMotives = badFeedMotives;
//# sourceMappingURL=badFeedMotives.js.map