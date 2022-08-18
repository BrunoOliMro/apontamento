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
    res.cookie("barcode", barcode);
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
        if (resource.length > tool) {
            var secondSetup = performance.now();
            res.cookie("secondSetup", secondSetup);
            console.log("Iniciou processo: " + secondSetup);
            res.redirect(`/#/ferramenta/`);
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
    console.log("ODF FEED iniciado");
    const NUMERO_ODF = req.query["NUMERO_ODF"].trim() || undefined;
    const CODIGO_MAQUINA = req.query["CODIGO_MAQUINA"].trim() || undefined;
    const NUMERO_OPERACAO = req.query["NUMERO_OPERACAO"].trim() || undefined;
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
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
        res.json(resource);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("ODF FEED finalizado");
        await connection.close();
        next();
    }
});
apiRouter.route("/ferramenta")
    .get(async (req, res) => {
    var APT_TEMPO_OPERACAO = req.query["APT_TEMPO_OPERACAO"];
    var secondSetup = performance.now();
    const tools = 0;
    const getSecondTimer = req.cookies["secondSetup"];
    var ffSetup = getSecondTimer - secondSetup;
    APT_TEMPO_OPERACAO = ffSetup;
    var processSetup = performance.now();
    res.cookie("processSetup", processSetup);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        if (tools === 0) {
            const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + APT_TEMPO_OPERACAO + ')');
            console.log("Tempo de Ferramenta: " + APT_TEMPO_OPERACAO);
            res.redirect(`/#/codigobarras/apontamento`);
        }
        else {
            res.redirect(`/#/ferramenta`);
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("get FERRAMENTA finalizado");
        await connection.close();
    }
});
apiRouter.route("/apontar")
    .post(async (req, _res, next) => {
    console.log("POST iniciado");
    const status = '';
    const goodFeed = 1;
    const badFeed = 1;
    const NUMERO_ODF = 548548;
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
    var APT_TEMPO_OPERACAO = req.query["APT_TEMPO_OPERACAO"];
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const processSetup = req.cookies["processSetup"];
        var endTimer = performance.now();
        var secondSetup = processSetup - endTimer;
        APT_TEMPO_OPERACAO = secondSetup;
        const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + APT_TEMPO_OPERACAO + ')');
        console.log("Produção : " + APT_TEMPO_OPERACAO);
        var ripTimer = performance.now();
        _res.cookie("ripTimer", ripTimer);
        console.log("inicou o processo da rip : " + ripTimer);
        _res.redirect(`/#/rip`);
    }
    catch (error) {
        _res.redirect(`/#/rip`);
    }
    finally {
        await connection.close();
        next();
    }
});
apiRouter.route("/rip")
    .get(async (req, _res) => {
    var APT_TEMPO_OPERACAO = req.query["APT_TEMPO_OPERACAO"];
    var APT_TEMPO_OPERACAO_TOTAL = req.query["APT_TEMPO_OPERACAO"];
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const ripTimer = req.cookies["ripTimer"];
        var endTimer = performance.now();
        var finalRipTimer = ripTimer - endTimer;
        APT_TEMPO_OPERACAO = finalRipTimer;
        const secondSetup = req.cookies["secondSetup"];
        var endTimer = performance.now();
        var finalsecondSetup = secondSetup - endTimer;
        APT_TEMPO_OPERACAO_TOTAL = finalsecondSetup;
        const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + APT_TEMPO_OPERACAO + ')');
        console.log("Rip: " + APT_TEMPO_OPERACAO);
        const insertSql2 = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + APT_TEMPO_OPERACAO_TOTAL + ')');
        console.log("Completo: " + APT_TEMPO_OPERACAO_TOTAL);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("RIP finalizada");
        await connection.close();
    }
});
exports.default = apiRouter;
//# sourceMappingURL=router.js.map