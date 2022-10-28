"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historic = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const sanitize_1 = require("../utils/sanitize");
const historic = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let NUMERO_ODF = Number((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]));
    try {
        const resource = await connection.query(`
        SELECT
        *
        FROM VW_APP_APONTAMENTO_HISTORICO
        WHERE 1 = 1
        AND ODF = '${NUMERO_ODF}'
        ORDER BY OP ASC
        `.trim()).then(result => result.recordset);
        if (resource.length <= 0) {
            return res.json({ message: 'sem historico a exibir' });
        }
        else {
            let objRes = {
                resource: resource,
                message: 'historico encontrado'
            };
            return res.json(objRes);
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro ao localizar o historico' });
    }
    finally {
    }
};
exports.historic = historic;
//# sourceMappingURL=historic.js.map