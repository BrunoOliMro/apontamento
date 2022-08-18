"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../global.config");
const apiRouter = (0, express_1.Router)();
apiRouter.route("/apontamento")
    .post(async (req, _res, next) => {
    req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
    return next();
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
    }
}, async (req, res, next) => {
    const barcode = req.body["codigoBarras"];
    const tool = 0;
    if (barcode === "")
        throw new Error("Código de barras inválido");
    const dados = {
        numOdf: Number(barcode.slice(10)),
        numOper: barcode.slice(0, 5),
        codMaq: barcode.slice(5, 10),
    };
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
                    SELECT TOP 1
                    [NUMERO_ODF], 
                    [CODIGO_MAQUINA],
                    [NUMERO_OPERACAO]
                    FROM PCP_PROGRAMACAO_PRODUCAO
                    WHERE 1 = 1
                    AND [NUMERO_ODF] = ${dados.numOdf}
                    AND [CODIGO_MAQUINA] = '${dados.codMaq}'
                    AND [NUMERO_OPERACAO] = ${dados.numOper}
                    ORDER BY NUMERO_OPERACAO ASC
                    `.trim()).then(result => result.recordset);
        console.log(resource);
        if (resource.length > tool) {
            res.redirect(`/#/ferramenta`);
        }
        else {
            res.redirect(`/#/codigobarras`);
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await connection.close();
        next();
    }
})
    .get(async (req, res, next) => {
    console.log("GET iniciado");
    const NUMERO_ODF = req.query["NUMERO_ODF"].trim() || undefined;
    const CODIGO_MAQUINA = req.query["CODIGO_MAQUINA"].trim() || undefined;
    const NUMERO_OPERACAO = req.query["NUMERO_OPERACAO"].trim() || undefined;
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        console.log("SELECT iniciado");
        const resource = await connection.query(`
                SELECT TOP 1
                [NUMERO_ODF], 
                [CODIGO_MAQUINA], 
                [NUMERO_OPERACAO],
                [QTDE_ODF],
                [CODIGO_CLIENTE],
                [CODIGO_PECA],
                [DT_INICIO_OP],
                [DT_FIM_OP],
                [QTDE_ODF],
                [QTDE_APONTADA],
                [DT_ENTREGA_ODF],
                [QTD_REFUGO],
                [HORA_INICIO],
                [HORA_FIM],
                [CODIGO_PECA]
                FROM PCP_PROGRAMACAO_PRODUCAO
                WHERE 1 = 1
                AND [NUMERO_ODF] = ${NUMERO_ODF}
                AND [CODIGO_MAQUINA] = '${CODIGO_MAQUINA}'
                AND [NUMERO_OPERACAO] = ${NUMERO_OPERACAO}
                ORDER BY NUMERO_OPERACAO ASC`.trim()).then(result => result.recordset);
        console.log("SELECT finalizado");
        res.json(resource);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("GET finalizado");
        await connection.close();
        next();
    }
});
apiRouter.route("/apontar")
    .post(async (req, _res, next) => {
    console.log("POST iniciado");
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const status = '';
    const goodFeed = req.body["goodFeed"] = sanitize(req.body["goodFeed"].trim());
    const badFeed = req.body["badFeed"] = sanitize(req.body["badFeed"].trim());
    const NUMERO_ODF = 599998;
    const NUMERO_OPERACAO = "'50'";
    const CODIGO_MAQUINA = "'LASO1'";
    const EMPRESA_RECNO = 1;
    const QTDE_APONTADA = 1;
    const QTD_REFUGO = 1;
    const dados2 = {
        apontaTempo: status
    };
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
    }
    console.log("esse é os bons: " + goodFeed);
    console.log("esse é os ruins: " + badFeed);
    try {
        const insertSql = await connection.query('INSERT INTO PCP_PROGRAMACAO_PRODUCAO(NUMERO_ODF,NUMERO_OPERACAO,CODIGO_MAQUINA,EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO) VALUES (' + NUMERO_ODF + ',' + NUMERO_OPERACAO + ',' + CODIGO_MAQUINA + ',' + EMPRESA_RECNO + ',' + QTDE_APONTADA + ',' + QTD_REFUGO + ')');
        console.log("deu");
        console.log(dados2.apontaTempo);
        console.log(insertSql);
        _res.redirect(`/#/rip`);
    }
    catch (error) {
        console.log(error);
        _res.redirect(`/#/rip`);
    }
    finally {
        console.log("POST finalizado");
        await connection.close();
        next();
    }
});
exports.default = apiRouter;
//# sourceMappingURL=router.js.map