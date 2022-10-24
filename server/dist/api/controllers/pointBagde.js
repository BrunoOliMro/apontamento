"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointBagde = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const pointBagde = async (req, res) => {
    let MATRIC = req.body["MATRIC"];
    if (MATRIC === undefined || MATRIC === null) {
        MATRIC = '0';
    }
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }
    MATRIC = sanitize(MATRIC);
    if (MATRIC == '') {
        return res.redirect("/#/codigobarras?error=invalidBadge");
    }
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const selecionarMatricula = await connection.query(` 
        SELECT TOP 1 [MATRIC], [FUNCIONARIO] FROM FUNCIONARIOS WHERE 1 = 1 AND [MATRIC] = '${MATRIC}'
            `.trim()).then(result => result.recordset);
        if (selecionarMatricula.length > 0) {
            let start = new Date();
            res.cookie("starterBarcode", start);
            res.cookie("MATRIC", selecionarMatricula[0].MATRIC);
            res.cookie("FUNCIONARIO", selecionarMatricula[0].FUNCIONARIO);
            return res.redirect("/#/codigobarras?status=ok");
        }
        if (!selecionarMatricula) {
            return res.redirect("/#/codigobarras?error=invalidBadge");
        }
    }
    catch (error) {
        console.log(error);
        return res.redirect("/#/codigobarras?error=invalidBadge");
    }
    finally {
    }
};
exports.pointBagde = pointBagde;
//# sourceMappingURL=pointBagde.js.map