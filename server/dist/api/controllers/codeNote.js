"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeNote = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const codeNote = async (req, res, next) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let dados = (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    try {
        const codIdApontamento = await connection.query(`
            SELECT 
            TOP 1 
            CODAPONTA 
            FROM 
            HISAPONTA 
            WHERE 1 = 1 
            AND ODF = '${dados.numOdf}'
            AND NUMOPE = '${dados.numOper}'
            AND ITEM = '${dados.codMaq}'
            ORDER BY DATAHORA DESC
            `)
            .then(result => result.recordset);
        if (codIdApontamento.length > 0) {
            if (codIdApontamento[0]?.CODAPONTA === 1) {
                req.body.message = 'codeApont 1 setup iniciado';
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 2) {
                req.body.message = 'codeApont 2 setup finalizado';
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 3) {
                req.body.message = 'codeApont 3 prod iniciado';
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 4) {
                req.body.message = 'codeApont 4 prod finalzado';
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 5) {
                req.body.message = 'codeApont 5 maquina parada';
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 6) {
                req.body.message = 'codeApont 6 processo finalizado';
                next();
            }
            if (!codIdApontamento[0]?.CODAPONTA) {
                req.body.message = `qualquer outro codigo`;
                next();
            }
        }
        if (codIdApontamento.length <= 0) {
            req.body.message = 'insira cod 1';
            next();
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