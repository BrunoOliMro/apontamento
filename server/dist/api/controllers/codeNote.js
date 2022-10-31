"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeNote = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const codeNote = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let dados = (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    try {
        const resource = await connection.query(`
            SELECT 
            TOP 1 
            CODAPONTA 
            FROM 
            HISAPONTA 
            WHERE 1 = 1 
            AND ODF = '${dados.numOdf}'
            AND NUMOPE = '${dados.numOper}'
            AND ITEM = '${dados.codMaq}'
            ORDER BY DATAHORA DESC`)
            .then(result => result.recordset);
        if (resource.length > 0) {
            if (resource[0]?.CODAPONTA === 1) {
                return res.json({ message: `codeApont 1 setup iniciado` });
            }
            if (resource[0]?.CODAPONTA === 2) {
                return res.json({ message: `codeApont 2 setup finalizado` });
            }
            if (resource[0]?.CODAPONTA === 3) {
                return res.json({ message: `codeApont 3 prod iniciado` });
            }
            if (resource[0]?.CODAPONTA === 4) {
                return res.json({ message: `codeApont 4 prod finalzado` });
            }
            if (resource[0]?.CODAPONTA === 5) {
                return res.json({ message: `codeApont 5 maquina parada` });
            }
            if (resource[0]?.CODAPONTA === 6) {
                return res.json({ message: `codeApont 6 processo finalizado` });
            }
            else {
                return res.json({ message: `qualquer outro codigo` });
            }
        }
        else {
            return res.json({ message: 'erro ao localizar o codigo apontamento' });
        }
    }
    catch (error) {
        return res.json({ message: 'algo deu errado ao buscar pelo codigo de apontamento' });
    }
    finally {
    }
};
exports.codeNote = codeNote;
//# sourceMappingURL=codeNote.js.map