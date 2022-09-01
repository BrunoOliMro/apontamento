"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../global.config");
const pictures_1 = require("./pictures");
const apiRouter = (0, express_1.Router)();
apiRouter.route("/apontamentoCracha")
    .post(async (req, res, next) => {
    let maxRange = 600000;
    let MATRIC = req.body["MATRIC"].trim();
    res.cookie("MATRIC", MATRIC, { httpOnly: true, maxAge: maxRange });
    if (MATRIC === "") {
        res.redirect(`/#/codigobarras`);
    }
    else {
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        try {
            const resource = await connection.query(` 
                SELECT TOP 1
                [MATRIC],
                [FUNCIONARIO]
                FROM FUNCIONARIOS
                WHERE 1 = 1
                AND [MATRIC] = ${MATRIC}
                `.trim()).then(result => result.recordset);
            if (resource.length > 0) {
                let start = new Date();
                let mili = start.getMilliseconds();
                console.log(mili / 1000);
                res.cookie("starterBarcode", start.getTime());
                res.cookie("MATRIC", resource[0].MATRIC);
                res.cookie("FUNCIONARIO", resource[0].FUNCIONARIO);
                res.redirect("/#/codigobarras");
                return next();
            }
            else {
                res.redirect("/#/codigobarras");
                return next();
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            await connection.close();
            next();
        }
    }
});
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
    if (barcode === "") {
        res.redirect('/#/codigobarras');
    }
    else {
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
                        [NUMERO_OPERACAO],
                        [CODIGO_PECA]
                        FROM            
                        PCP_PROGRAMACAO_PRODUCAO
                        WHERE 1 = 1
                        AND [NUMERO_ODF] = ${dados.numOdf}
                        AND [CODIGO_MAQUINA] = '${dados.codMaq}'
                        AND [NUMERO_OPERACAO] = ${dados.numOper}
                        AND [CODIGO_PECA] IS NOT NULL
                        ORDER BY NUMERO_OPERACAO ASC
                        `.trim()).then(result => result.recordset);
            res.cookie("NUMERO_ODF", resource[0].NUMERO_ODF);
            res.cookie("CODIGO_MAQUINA", resource[0].CODIGO_MAQUINA);
            res.cookie("NUMERO_OPERACAO", resource[0].NUMERO_OPERACAO);
            res.cookie("CODIGO_PECA", resource[0].CODIGO_PECA);
            res.redirect("/#/ferramenta");
            if (tool > 0) {
                var secondSetup = performance.now();
                res.cookie("secondSetup", secondSetup);
                console.log("Iniciou processo: " + secondSetup);
                res.redirect("/#/ferramenta");
            }
            else {
                res.redirect("/#/codigobarras");
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            await connection.close();
            next();
        }
    }
})
    .get(async (req, res, next) => {
    let NUMERO_ODF = req.query["NUMERO_ODF"].trim() || undefined;
    let CODIGO_MAQUINA = req.query["CODIGO_MAQUINA"].trim() || undefined;
    let NUMERO_OPERACAO = req.query["NUMERO_OPERACAO"].trim() || undefined;
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
                [HORA_FIM]
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
        await connection.close();
        next();
    }
});
apiRouter.route("/IMAGEM")
    .get(async (req, res) => {
    const NUMPEC = req.cookies["CODIGO_PECA"];
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT TOP 1
            [NUMPEC],
            [IMAGEM]
            FROM PROCESSO (NOLOCK)
            WHERE 1 = 1
            AND NUMPEC = '${NUMPEC}'
            AND IMAGEM IS NOT NULL
            `);
        const result = resource.recordset.map(record => {
            const imgPath = pictures_1.pictures.getPicturePath(record["NUMPEC"], record["IMAGEM"]);
            return {
                img: imgPath,
            };
        });
        res.json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/HISTORICO")
    .get(async (req, res, next) => {
    let NUMERO_ODF = req.cookies["NUMERO_ODF"];
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT
            *
            FROM VW_APP_APONTAMENTO_HISTORICO
            WHERE 1 = 1
            AND [ODF] = ${NUMERO_ODF}
            `);
        res.json(resource);
        return next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/ferramenta")
    .get(async (req, res, next) => {
    const tools = 0;
    let end = new Date();
    let start = req.cookies["starterBarcode"];
    let final = end.getTime() - Number(start);
    console.log("Primeira operação: " + final / 1000 + " segundos");
    let startProd = new Date();
    let mili = startProd.getMilliseconds();
    console.log(mili / 1000);
    res.cookie("startProd", startProd.getTime());
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        if (tools === 0) {
            const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')');
            res.redirect(`/#/ferramenta`);
            return next();
        }
        else {
            res.redirect(`/#/ferramenta`);
            return next();
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await connection.close();
        return next();
    }
})
    .get(async (req, res) => {
    const CODIGO = req.cookies["CODIGO_PECA"];
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    console.log(CODIGO);
    try {
        const resource = await connection.query(`
            SELECT 
            [IMAGEM], 
            [CODIGO]
            FROM VIEW_APTO_FERRAMENTAL 
            WHERE 1 = 1
            AND CODIGO = '${CODIGO}'
            AND IMAGEM IS NOT NULL
            `);
        const result = resource.recordset.map(record => {
            const imgPath = pictures_1.pictures.getPicturePath(record["CODIGO"], record["IMAGEM"]);
            return {
                img: imgPath,
                razao: record["RAZAO"],
                codigoInterno: record["CODIGO"],
                total: record["TOTAL"],
            };
        });
        if (result.length > 0) {
            res.json();
        }
        else {
            res.redirect("/#/apontamento");
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/apontar")
    .post(async (req, _res, next) => {
    let status = '';
    let NUMERO_ODF = req.cookies["NUMERO_ODF"];
    let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"];
    let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"];
    let EMPRESA_RECNO = 1;
    let QTDE_APONTADA = req.body["goodFeed"];
    let QTD_REFUGO = req.body["badfeed"];
    let CST_PC_FALTANTE = req.body["reworkFeed"];
    let CST_QTD_RETRABALHADA = req.body["missingFeed"];
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
    }
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        let endProdTimer = new Date();
        let startProd = req.cookies["startProd"];
        let finalProdTimer = endProdTimer.getTime() - Number(startProd);
        console.log("Primeira operação: " + finalProdTimer / 1000 + " segundos");
        let startRip = new Date();
        let mili = startRip.getMilliseconds();
        console.log(mili / 1000);
        _res.cookie("startRip", startRip.getTime());
        const insertSqlRework = await connection.query('INSERT INTO HISAPONTA(CST_PC_FALTANTE, CST_QTD_RETRABALHADA) VALUES (' + CST_PC_FALTANTE + ',' + CST_QTD_RETRABALHADA + ')');
        const insertSql = await connection.query('INSERT INTO PCP_PROGRAMACAO_PRODUCAO(NUMERO_ODF,NUMERO_OPERACAO,CODIGO_MAQUINA,EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO) VALUES (' + NUMERO_ODF + ',' + NUMERO_OPERACAO + ',' + CODIGO_MAQUINA + ',' + EMPRESA_RECNO + ',' + QTDE_APONTADA + ',' + QTD_REFUGO + ')');
        console.log(insertSql);
        const insertSqlTimer = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdTimer + ')');
        _res.redirect(`/#/rip`);
        return next();
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
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        let end = new Date();
        let start = req.cookies["starterBarcode"];
        let final = end.getTime() - Number(start);
        let endProdRip = new Date();
        let startRip = req.cookies["startRip"];
        let finalProdRip = endProdRip.getTime() - Number(startRip);
        const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdRip + ')');
        console.log("Rip: " + finalProdRip / 1000 + " segundos");
        const insertSql2 = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')');
        console.log("Completo: " + final / 1000 + " segundos");
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/desenho")
    .get(async (req, res) => {
    let end = new Date();
    let start = req.cookies["start"];
    let final = end.getTime() - Number(start);
    console.log("operação: " + final + " milisegundos");
    const NUMPEC = req.cookies["CODIGO_PECA"];
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT
            [NUMPEC],
            [IMAGEM]
            FROM QA_LAYOUT (NOLOCK) 
            WHERE 1 = 1 
            AND NUMPEC = '${NUMPEC}'
            AND IMAGEM IS NOT NULL`);
        const result = resource.recordset.map(record => {
            const imgPath = pictures_1.pictures.getPicturePath(record["NUMPEC"], record["IMAGEM"]);
            return {
                img: imgPath,
                razao: record["RAZAO"],
                codigoInterno: record["NUMPEC"],
                total: record["TOTAL"],
            };
        });
        res.json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
exports.default = apiRouter;
//# sourceMappingURL=router.js.map