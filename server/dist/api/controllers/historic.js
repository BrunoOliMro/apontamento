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
    let resultPeçasBoas;
    try {
        const resource = await connection.query(`
        SELECT
        *
        FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO
        WHERE 1 = 1
        AND ODF = '${NUMERO_ODF}'
        ORDER BY DATAHORA DESC
        `.trim()).then(result => result.recordset);
        const resourceDetail = await connection.query(`
        SELECT
        *
        FROM VW_APP_APONTAMENTO_HISTORICO
        WHERE 1 = 1
        AND ODF = '${NUMERO_ODF}'
        ORDER BY OP ASC
        `.trim()).then(result => result.recordset);
        let obj = [];
        for (const iterator of resource) {
            if (iterator.BOAS > 0) {
                obj.push(iterator);
            }
            if (iterator.REFUGO > 0) {
                obj.push(iterator);
            }
        }
        resultPeçasBoas = resource.reduce((acc, iterator) => {
            return acc + iterator.BOAS + iterator.REFUGO;
        }, 0);
        console.log("linha 35", obj);
        if (resultPeçasBoas > 0) {
            let objRes = {
                resourceDetail: resourceDetail,
                resource: obj,
                message: 'Exibir histórico'
            };
            return res.json(objRes);
        }
        if (resultPeçasBoas <= 0) {
            return res.json({ message: 'Não há histórico a exibir' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'Error ao localizar o histórico' });
    }
    finally {
    }
};
exports.historic = historic;
//# sourceMappingURL=historic.js.map