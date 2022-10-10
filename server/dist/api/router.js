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
    let codigoOperArray = queryGrupoOdf.map(e => e.NUMERO_OPERACAO);
    let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",");
    let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((e) => e === dados.numOper);
    let objOdfSelecionada = queryGrupoOdf[indiceDoArrayDeOdfs];
    let objOdfSelecProximo = queryGrupoOdf[indiceDoArrayDeOdfs + 1];
    res.cookie("numeroOperacaoProximaOdf", objOdfSelecProximo.NUMERO_OPERACAO);
    res.cookie("codMaqProxOdf", objOdfSelecProximo.CODIGO_MAQUINA);
    let objOdfSelecAnterior = queryGrupoOdf[indiceDoArrayDeOdfs - 1];
    if (indiceDoArrayDeOdfs <= 0 || indiceDoArrayDeOdfs === undefined) {
        objOdfSelecAnterior = objOdfSelecionada;
    }
    let QTDE_LIB_ANTERIOR = objOdfSelecAnterior.QTDE_APONTADA;
    let apontaLib = objOdfSelecAnterior.APONTAMENTO_LIBERADO;
    if (indiceDoArrayDeOdfs <= 0 && apontaLib === 'N') {
        const updateNtoS = await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' AND CODIGO_MAQUINA = '${dados.codMaq}'
            `.trim())
            .then(result => result.recordset);
    }
    else if (indiceDoArrayDeOdfs >= 0 && apontaLib === 'N') {
        return res.status(400).redirect("/#/codigobarras?error=anotherodfexpected");
    }
    res.cookie('QTDE_LIB_ANTERIOR', QTDE_LIB_ANTERIOR);
    res.cookie("NUMERO_ODF", objOdfSelecionada.NUMERO_ODF);
    res.cookie("CODIGO_PECA", objOdfSelecionada.CODIGO_PECA);
    res.cookie("CODIGO_MAQUINA", objOdfSelecionada.CODIGO_MAQUINA);
    res.cookie("NUMERO_OPERACAO", objOdfSelecionada.NUMERO_OPERACAO);
    res.cookie("REVISAO", objOdfSelecionada.REVISAO);
    const processoTemP = await connection.query(`
        SELECT
        NUMPEC, 
        NUMOPE, 
        NUMSEQ, 
        MAQUIN, 
        NUMITE, 
        CONDIC
        FROM
        OPERACAO
        WHERE 1 = 1 
        AND [CONDIC] = 'P'
        AND [NUMPEC] = '${objOdfSelecionada.CODIGO_PECA}'
        `).then(result => result.recordset);
    console.log('processoTemP: LINHA 104', processoTemP);
    res.cookie("CONDIC", processoTemP);
    if (processoTemP.length > 0) {
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
            let qtdProdOdf = Number(resource2[0].QTDE_ODF);
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
    else {
        return res.status(400).redirect("/#/ferramenta?status=pdoesntexists");
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
    let tempoAgora = new Date();
    let newEnd = tempoAgora.getMilliseconds() / 1000;
    console.log(newEnd);
    try {
        const resource = await connection.query(`
            SELECT TOP 1 EXECUT FROM OPERACAO WHERE NUMPEC = '${numpec}' AND MAQUIN = '${maquina}' ORDER BY REVISAO DESC
            `).then(record => record.recordset);
        let qtdProd = req.cookies["qtdProduzir"][0];
        let resultadoEmSegundos = resource[0].EXECUT * 1000;
        let tempoTotalExecução = resultadoEmSegundos * qtdProd;
        let tempoFinal = newEnd - tempoInicio;
        let tempoTotal = tempoTotalExecução - tempoFinal;
        console.log(tempoTotal);
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
    let numeroOperacao = req.cookies['numeroOperacao'];
    let codigoMaq = req.cookies['codigoMaq'];
    let codAponta = 1;
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        let end = new Date();
        let newEnd = end.getMilliseconds() / 1000;
        let start = req.cookies["starterBarcode"];
        let final = newEnd - start;
        const insertSql = await connection.query(`UPDATE HISAPONTA SET APT_TEMPO_OPERACAO = APT_TEMPO_OPERACAO + '${final}'  WHERE 1 = 1 AND ODF = '${numero_odf}' AND NUMOPE = '${numeroOperacao}' AND ITEM = '${codigoMaq}'`);
        console.log("insertSqlTimer: linha 418", insertSql);
        console.log("Insert: linha 419:", insertSql);
        const resss = await connection.query(`UPDATE HISAPONTA SET CODAPONTA = '${codAponta}'  WHERE 1 = 1 AND ODF = '${numero_odf}' AND NUMOPE = '${numeroOperacao}' AND ITEM = '${codigoMaq}'`);
        console.log("resss: linha 422", resss);
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
    let NUMERO_ODF = req.cookies["NUMERO_ODF"];
    let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"];
    let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"];
    let numeroOpeProx = req.cookies['numeroOperacaoProximaOdf'];
    let codProxMaq = req.cookies['codMaqProxOdf'];
    let QTDE_APONTADA = 61;
    let condic = req.cookies['CONDIC'];
    let codAponta = '2';
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }
    let startRip = new Date();
    let mili = startRip.getMilliseconds();
    res.cookie("startRip", startRip.getTime());
    let endProdTimer = new Date();
    let startProd = req.cookies["startProd"];
    let finalProdTimer = endProdTimer.getTime() - startProd / 1000;
    const insertSqlTimer = await connection.query(`UPDATE HISAPONTA SET APT_TEMPO_OPERACAO = APT_TEMPO_OPERACAO + '${finalProdTimer}'  WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND NUMOPE = '${NUMERO_OPERACAO}' AND ITEM = '${CODIGO_MAQUINA}'`);
    console.log("insertSqlTimer: linha 551", insertSqlTimer);
    const updateProxOdfToS = await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${codProxMaq}'`).then(result => result.recordset);
    console.log('updateProxOdfToS ', updateProxOdfToS);
    const resss = await connection.query(`UPDATE HISAPONTA SET CODAPONTA = '${codAponta}'  WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND NUMOPE = '${NUMERO_OPERACAO}' AND ITEM = '${CODIGO_MAQUINA}'`);
    console.log("resss: linha 527", resss);
    try {
        const updateProxOdfToS = await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA =  '${QTDE_APONTADA}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${numeroOpeProx}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`).then(result => result.recordset);
        console.log("updateProxOdfToS linha 536", updateProxOdfToS);
    }
    catch (error) {
        console.log(error);
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
    let NUMERO_ODF = req.cookies['NUMERO_ODF'];
    let NUMERO_OPERACAO = req.cookies['NUMERO_OPERACAO'];
    let CODIGO_MAQUINA = req.cookies['CODIGO_MAQUINA'];
    let SETUP = req.body.SETUP.trim();
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
    let end = new Date();
    let newNemEnd = end.getMilliseconds() / 1000;
    let start = req.cookies["starterBarcode"];
    let final = newNemEnd - start;
    const insertSqlTimerq = await connection.query(`UPDATE HISAPONTA SET APT_TEMPO_OPERACAO = APT_TEMPO_OPERACAO + '${final}'  WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND NUMOPE = '${NUMERO_OPERACAO}' AND ITEM = '${CODIGO_MAQUINA}'`);
    console.log("insertSqlTimer: linha 551", insertSqlTimerq);
    let endProdRip = new Date();
    let newendProdRip = endProdRip.getMilliseconds() / 1000;
    let startRip = req.cookies["startRip"];
    let finalProdRip = newendProdRip - startRip;
    const insertSqlTimer = await connection.query(`UPDATE HISAPONTA SET APT_TEMPO_OPERACAO = APT_TEMPO_OPERACAO + '${finalProdRip}'  WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND NUMOPE = '${NUMERO_OPERACAO}' AND ITEM = '${CODIGO_MAQUINA}'`);
    console.log("insertSqlTimer: linha 551", insertSqlTimer);
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
            UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + 1 WHERE 1= 1 AND ODF= '${NUMERO_ODF}' AND CODIGO_FILHO = '105830489-1'`);
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