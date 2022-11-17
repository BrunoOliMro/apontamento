"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointBagde = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const pointBagde = async (req, res) => {
    let matricula = String((0, sanitize_1.sanitize)(req.body["cracha"])) || null;
    let start = new Date() || 0;
    if (!matricula) {
        return res.json({ message: "codigo de matricula vazia" });
    }
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const selecionarMatricula = await connection.query(` 
        SELECT TOP 1 [MATRIC], [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${matricula}' ORDER BY FUNCIONARIO
            `.trim()).then(result => result.recordset);
        if (selecionarMatricula.length > 0) {
            const strStartTime = (0, encryptOdf_1.encrypted)(String(start.getTime()));
            const encryptedEmployee = (0, encryptOdf_1.encrypted)(selecionarMatricula[0].FUNCIONARIO);
            const encryptedBadge = (0, encryptOdf_1.encrypted)(selecionarMatricula[0].CRACHA);
            res.cookie("starterBarcode", strStartTime);
            res.cookie("FUNCIONARIO", encryptedEmployee);
            res.cookie("CRACHA", encryptedBadge);
            return res.json({ message: 'cracha encontrado' });
        }
        else {
            return res.json({ message: 'cracha não encontrado' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro ao tentar localizar cracha' });
    }
    finally {
    }
};
exports.pointBagde = pointBagde;
//# sourceMappingURL=pointBagde.js.map