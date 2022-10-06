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
apiRouter.route("/apontamento")
    .post(async (req, res) => {
    req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
    let barcode = req.body["codigoBarras"];
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }
    if (barcode == '') {
        res.status(400).redirect("/#/codigobarras?error=invalidBarcode");
    }
    const dados = {
        numOdf: Number(barcode.slice(10)),
        numOper: String(barcode.slice(0, 5)),
        codMaq: String(barcode.slice(5, 10)),
    };
    if (barcode.length > 17) {
        dados.numOdf = barcode.slice(11);
        dados.numOper = barcode.slice(0, 5);
        dados.codMaq = barcode.slice(5, 11);
    }
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const queryGrupoOdf = await connection.query(`
        SELECT 
        * 
        FROM
        VW_APP_APTO_PROGRAMACAO_PRODUCAO
        WHERE 1 = 1 
        AND [NUMERO_ODF] = ${dados.numOdf}
        AND [CODIGO_PECA] IS NOT NULL
        ORDER BY NUMERO_OPERACAO ASC
                        `.trim()).then(result => result.recordset);
    console.log(queryGrupoOdf);
    console.log("tamanho do array: ", queryGrupoOdf.length);
    let e = queryGrupoOdf.map(e => { '000' + e.NUMERO_OPERACAO; });
    let s = dados.numOper;
    console.log(s);
    console.log(e);
    if (resourc2e > 0) {
        return;
    }
    if (resourc2e[0].CONDIC == "P") {
        let apontLib = String(resourc2e[0].APONTAMENTO_LIBERADO);
        console.log("apontLib", apontLib);
        try {
            const resource2 = await connection.query(`
                        SELECT DISTINCT                 
                           OP.NUMITE,                 
                           CAST(OP.EXECUT AS INT) AS EXECUT,       
                           CAST(E.SALDOREAL AS INT) AS SALDOREAL,                 
                           CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,
                           ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as saldo_alocado
                           FROM PROCESSO PRO (NOLOCK)                  
                           INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O_                  
                           INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITE                
                           INNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEC                
                           WHERE 1=1                    
                           AND PRO.ATIVO ='S'                   
                           AND PRO.CONCLUIDO ='T'                
                           AND OP.CONDIC ='P'                 
                           AND PCP.NUMERO_ODF = '${dados.numOdf}'    
                        `.trim()).then(result => result.recordset);
            let condic = resourc2e[0].CONDIC;
            console.log("condicional P ", condic);
            console.log("resource2:78", resource2);
            function calMaxQuant(qtdNecessPorPeca, saldoReal) {
                const pecasPaiPorComponente = qtdNecessPorPeca.map((qtdPorPeca, i) => {
                    return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
                });
                const qtdMaxProduzivel = pecasPaiPorComponente.reduce((qtdMax, pecasPorComp) => {
                    return Math.min(qtdMax, pecasPorComp);
                }, Infinity);
                Math.round(qtdMaxProduzivel);
                return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
            }
            const execut = resource2.map(item => item.EXECUT);
            const saldoReal = resource2.map(item => item.SALDOREAL);
            console.log("execut:99", execut, "saldoReal:99", saldoReal);
            let qtdTotal = calMaxQuant(execut, saldoReal);
            console.log("qtdTotal", qtdTotal);
            const reservedItens = execut.map((quantItens) => {
                return Math.floor((qtdTotal || 0) * quantItens);
            }, Infinity);
            res.cookie("reservedItens", reservedItens);
            const codigoFilho = resource2.map(item => item.NUMITE);
            res.cookie("codigoFilho", codigoFilho);
            let qtdProdOdf = Number(resourc2e[0].QTDE_ODF);
            let resultadoFinalProducao = Number(Number(qtdTotal) - Number(qtdProdOdf));
            if (resultadoFinalProducao <= 0) {
                resultadoFinalProducao = 0;
                return resultadoFinalProducao;
            }
            res.cookie("resultadoFinalProducao", resultadoFinalProducao);
            try {
                const updateQtyQuery = [];
                const updateQtyRes = [];
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
                }
                const updateQty = await connection.query(updateQtyQuery.join("\n"));
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
                }
                const updateRes = await connection.query(updateQtyRes.join("\n"));
                console.log("updateQty: linha 122", updateQty);
                console.log("updateRes: linha 123", updateRes);
                return res.status(200).redirect("/#/codigobarras?red=red");
            }
            catch (err) {
                console.log("Erro:135", err);
                return res.status(400).redirect("/#/codigobarras?error=invalidBarcode");
            }
        }
        catch (error) {
            console.log("erro linha 138", error);
            return res.status(400).redirect("/#/codigobarras?error=invalidBarcode");
        }
        finally {
            await connection.close();
        }
    }
    else if (resourc2e.length > 0) {
    }
    else {
        console.log("Não encontrou ODF com esse número");
        return res.status(400).redirect("/#/codigobarras?error=invalidBarcode");
    }
});
apiRouter.route("/apontamentoCracha")
    .post(async (req, res) => {
    let finalTimer = 6000000;
    let MATRIC = String(req.body["MATRIC"].trim());
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }
    MATRIC = sanitize(MATRIC);
    if (MATRIC == '') {
        res.status(400).redirect("/#/codigobarras?error=invalidBadge");
    }
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
            let mili = start.getMilliseconds() / 1000;
            res.cookie("starterBarcode", mili);
            res.cookie("MATRIC", resource[0].MATRIC, { httpOnly: true, maxAge: finalTimer });
            res.cookie("FUNCIONARIO", resource[0].FUNCIONARIO);
            res.status(200).redirect("/#/codigobarras?status=ok");
        }
        else {
            res.status(404).redirect("/#/codigobarras?error=invalidBadge");
        }
    }
    catch (error) {
        res.status(404).redirect("/#/codigobarras?error=invalidBadge");
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/odf")
    .get(async (req, res) => {
    let NUMERO_ODF = String(req.cookies["NUMERO_ODF"]);
    let CODIGO_MAQUINA = String(req.cookies["CODIGO_MAQUINA"]);
    let NUMERO_OPERACAO = String(req.cookies["NUMERO_OPERACAO"]);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
                SELECT TOP 1
                [CODIGO_CLIENTE],
                [QTDE_ODF],
                [CODIGO_PECA],
                [DT_INICIO_OP],
                [DT_FIM_OP],
                [QTDE_ODF],
                [QTDE_APONTADA],
                [DT_ENTREGA_ODF],
                [QTD_REFUGO],
                [HORA_INICIO],
                [HORA_FIM]
                FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO
                WHERE 1 = 1
                AND [NUMERO_ODF] = ${NUMERO_ODF}
                AND [CODIGO_MAQUINA] = '${CODIGO_MAQUINA}'
                AND [NUMERO_OPERACAO] = ${NUMERO_OPERACAO}
                ORDER BY NUMERO_OPERACAO ASC`.trim()).then(result => result.recordset);
        res.cookie("qtdProduzir", resource[0].QTDE_ODF);
        res.json(resource);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/imagem")
    .get(async (req, res) => {
    const numpec = req.cookies["CODIGO_PECA"];
    const revisao = String(req.cookies['REVISAO']);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let statusImg = "_status";
    try {
        const resource = await connection.query(`
            SELECT TOP 1
            [NUMPEC],
            [IMAGEM]
            FROM PROCESSO (NOLOCK)
            WHERE 1 = 1
            AND NUMPEC = '${numpec}'
            AND REVISAO = '${revisao}'
            AND IMAGEM IS NOT NULL
            `).then(res => res.recordset);
        let imgResult = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
            imgResult.push(path);
        }
        res.json(imgResult);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/status")
    .get(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let tempoInicio = req.cookies["starterBarcode"];
    let numpec = req.cookies['CODIGO_PECA'];
    let maquina = req.cookies['CODIGO_MAQUINA'];
    try {
        const resource = await connection.query(`
            SELECT TOP 1 EXECUT FROM OPERACAO WHERE NUMPEC = '${numpec}' AND MAQUIN = '${maquina}' ORDER BY REVISAO DESC
            `).then(record => record.recordset);
        res.cookie("Tempo Execucao", resource[0].EXECUT);
        let qtdProd = req.cookies["qtdProduzir"][0];
        let result = Number(resource[0].EXECUT * 1000);
        let tempoTotalExecução = Number(Number(result) * Number(qtdProd));
        let tempoTotal = Number(tempoTotalExecução) - Number(tempoInicio);
        res.json(tempoTotal);
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
    .get(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let NUMERO_ODF = req.cookies["NUMERO_ODF"];
    try {
        const resource = await connection.query(`
            SELECT
            *
            FROM VW_APP_APONTAMENTO_HISTORICO
            WHERE 1 = 1
            AND ODF = '${NUMERO_ODF}'
            ORDER BY OP ASC
            `.trim()).then(result => result.recordset);
        console.log("cade", resource);
        return res.json(resource);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/ferramenta")
    .get(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let CODIGO = String(req.cookies["CODIGO_PECA"]);
    let startProd = new Date();
    let newStartProd = Number(startProd.getMilliseconds() / 1000);
    res.cookie("startProd", newStartProd);
    let ferramenta = "_ferr";
    try {
        const resource = await connection.query(`
                SELECT

                    [CODIGO],
                    [IMAGEM]
                FROM VIEW_APTO_FERRAMENTAL 
                WHERE 1 = 1 
                    AND IMAGEM IS NOT NULL
                    AND CODIGO = '${CODIGO}'
            `).then(res => res.recordset);
        let result = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/ferselecionadas")
    .get(async (req, res) => {
    let numero_odf = req.cookies['NUMERO_ODF'];
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        let end = new Date();
        let newEnd = end.getMilliseconds() / 1000;
        let start = req.cookies["starterBarcode"];
        let final = Number(newEnd) - Number(start);
        const insertSql = await connection.query(`UPDATE HISAPONTA SET TEMPO_SETUP = TEMPO_SETUP + '${final}' WHERE 1 = 1 AND ODF = '${numero_odf}'`);
        console.log("Insert: linha 356:", insertSql);
        return res.status(200).json();
    }
    catch (error) {
        console.log(error);
        return res.status(400).redirect("/#/ferramenta");
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/apontar")
    .post(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    var codigoFilho = req.cookies['codigoFilho'];
    var reservedItens = req.cookies['reservedItens'];
    let NUMERO_ODF = req.cookies["NUMERO_ODF"].trim();
    let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"].trim();
    let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"].trim();
    let EMPRESA_RECNO = 1;
    let NUMPEC = req.cookies["CODIGO_PECA"].trim();
    let QTDE_APONTADA = req.body.goodFeed.trim();
    let qtdRefugo = req.body.badFeed.trim();
    let CST_PC_FALTANTE = req.body.missingFeed.trim();
    let CST_QTD_RETRABALHADA = req.body.reworkFeed.trim();
    let parcialFeed = req.body.parcial.trim();
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }
    QTDE_APONTADA = sanitize(req.body.goodFeed);
    qtdRefugo = sanitize(req.body.badFeed);
    CST_PC_FALTANTE = sanitize(req.body.missingFeed);
    CST_QTD_RETRABALHADA = sanitize(req.body.reworkFeed);
    parcialFeed = sanitize(req.body.parcial);
    let startRip = new Date();
    let mili = startRip.getMilliseconds();
    res.cookie("startRip", startRip.getTime());
    try {
        const updateQtyQuery = [];
        const updateQtyRes = [];
        for (const [i, qtdItem] of reservedItens.entries()) {
            updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
        }
        const updateQty = await connection.query(updateQtyQuery.join("\n"));
        console.log("updateQty: linha 510", updateQty);
        for (const [i, qtdItem] of reservedItens.entries()) {
            updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
        }
        const updateRes = await connection.query(updateQtyRes.join("\n"));
        console.log("updateRes: linha 517", updateRes);
        return res.status(200).redirect(`/#/rip`);
    }
    catch (err) {
        console.log("Erro:135", err);
        return res.status(400).redirect("/#/codigobarras/apontamento");
    }
});
apiRouter.route("/rip")
    .get(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let numpec = String(req.cookies["CODIGO_PECA"]);
    let revisao = String(req.cookies['REVISAO']);
    let startRip = new Date();
    let ripMiliseg = Number(startRip.getMilliseconds() / 1000);
    res.cookie("startRip", ripMiliseg);
    try {
        const resource = await connection.query(`
            SELECT  DISTINCT
            PROCESSO.NUMPEC,
            PROCESSO.REVISAO,
            QA_CARACTERISTICA.NUMCAR AS NUMCAR,
            QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE,
            QA_CARACTERISTICA.DESCRICAO,
            ESPECIFICACAO  AS ESPECIF,
            LIE,
            LSE,
            QA_CARACTERISTICA.INSTRUMENTO
            FROM PROCESSO
            INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO
            INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC
            AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA 
            AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO 
            LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA  
            FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE
			WHERE PROCESSO.NUMPEC = '${numpec}' 
            AND PROCESSO.REVISAO = '${revisao}' 
            AND NUMCAR < '2999'
            ORDER BY NUMPEC ASC
                `.trim()).then(result => result.recordset);
        return res.json(resource);
    }
    catch (error) {
        console.log(error);
        return res.status(400).redirect("/#/codigobarras/apontamento?error=ripnotFound");
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/lancamentoRip")
    .post(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let SETUP = req.body.SETUP.trim();
    console.log("debug: linha 603");
    let M2 = req.body["M2"].trim();
    let M3 = req.body["M3"].trim();
    let M4 = req.body["M4"].trim();
    let M5 = req.body["M5"].trim();
    let M6 = req.body["M6"].trim();
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
    }
    SETUP = sanitize(req.body.SETUP);
    console.log("SETUP: LINHA 619", SETUP);
    let end = new Date();
    let newNemEnd = Number(end.getMilliseconds() / 1000);
    let start = req.cookies["starterBarcode"];
    let final = Number(newNemEnd) - Number(start);
    console.log("Final: linha 625", final);
    let endProdRip = new Date();
    let newendProdRip = Number(endProdRip.getMilliseconds() / 1000);
    let startRip = req.cookies["startRip"];
    let finalProdRip = Number(newendProdRip) - Number(startRip);
    console.log("finalProdRip: linha 638", finalProdRip);
    const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdRip + ')');
    console.log("Rip: " + finalProdRip + " segundos");
    const insertSql2 = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')');
    console.log("Completo: " + final + " segundos");
    try {
        const resource = await connection.query('INSERT INTO CST_RIP_ODF_PRODUCAO(SETUP, M2,M3,M4,M5,M6) VALUES ('
            + SETUP + ','
            + M2 + ','
            + M3 + ','
            + M4 + ','
            + M5 + ','
            + M6 +
            ')').then(result => result.recordset);
        console.log(resource);
        res.json(resource);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/returnedValue")
    .post(async (req, res) => {
    console.log(req.body);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let NUMERO_ODF = req.cookies["NUMERO_ODF"].trim();
    console.log("debug: linha 672");
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
    }
    console.log("debug: linha 684");
    try {
        const resource = await connection.query(`
            UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + 1 WHERE 1= 1 AND ODF= '1232975' AND CODIGO_FILHO = '105830489-1'`);
        console.log("resource: linha 690?", resource);
        return res.status(200).redirect("/#/codigobarras");
    }
    catch (error) {
        console.log(error);
        return res.status(200).redirect("/#/rip?error=riperror");
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/parada")
    .get(async (req, res) => {
    let numeroOdf = req.cookies["NUMERO_ODF"];
    let peca = req.cookies['CODIGO_PECA'];
    let codAponta = '1';
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
                    UPDATE HISAPONTA  SET CODAPONTA =  '${codAponta}' WHERE 1 = 1 AND ODF = '${numeroOdf}' AND PECA= '${peca}'`);
        console.log(resource);
        res.status(200).json(resource);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/motivoParada")
    .get(async (_req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
                SELECT CODIGO,DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
        let resoc = resource.map(e => e.DESCRICAO);
        res.status(200).json(resoc);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/motivorefugo")
    .get(async (_req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT R_E_C_N_O_,DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
        let resoc = resource.map(e => e.DESCRICAO);
        return res.status(200).json(resoc);
    }
    catch (error) {
        return console.log(error);
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/desenho")
    .get(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const revisao = String(req.cookies['REVISAO']);
    const numpec = String(req.cookies["CODIGO_PECA"]);
    let desenho = "_desenho";
    try {
        const resource = await connection.query(`
            SELECT
            DISTINCT
                [NUMPEC],
                [IMAGEM],
                [REVISAO]
            FROM  QA_LAYOUT(NOLOCK) 
            WHERE 1 = 1 
                AND NUMPEC = '${numpec}'
                AND REVISAO = '${revisao}'
                AND IMAGEM IS NOT NULL`).then(res => res.recordset);
        let imgResult = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], desenho, String(i));
            imgResult.push(path);
        }
        return res.status(200).json(imgResult);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
exports.default = apiRouter;
//# sourceMappingURL=router.js.map