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
        return res.status(400).redirect("/#/codigobarras?error=invalidBarcode");
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
        SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO WHERE 1 = 1 AND NUMERO_ODF = '1444592' ORDER BY NUMERO_OPERACAO ASC
        `.trim()).then(result => result.recordset);
    if (queryGrupoOdf.length <= 0) {
        return res.json({ message: "okkk" });
    }
    let codigoOperArray = queryGrupoOdf.map(e => e.NUMERO_OPERACAO);
    let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",");
    let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((e) => e === dados.numOper);
    if (indiceDoArrayDeOdfs < 0) {
        indiceDoArrayDeOdfs = 0;
    }
    let objOdfSelecionada = queryGrupoOdf[indiceDoArrayDeOdfs];
    let objOdfSelecProximo = queryGrupoOdf[indiceDoArrayDeOdfs + 1];
    let objOdfSelecAnterior = queryGrupoOdf[indiceDoArrayDeOdfs - 1];
    let qtdLib = 0;
    let apontLib = '';
    let qntdeJaApontada = 0;
    let qtdLibMax = 0;
    let codigoMaquinaProxOdf;
    let codMaqProxOdf;
    if (indiceDoArrayDeOdfs === 0) {
        codigoMaquinaProxOdf = objOdfSelecProximo["CODIGO_MAQUINA"];
        codMaqProxOdf = objOdfSelecProximo["NUMERO_OPERACAO"];
        qntdeJaApontada = objOdfSelecionada["QTDE_APONTADA"];
        qtdLib = objOdfSelecionada["QTDE_ODF"];
        apontLib = objOdfSelecionada["APONTAMENTO_LIBERADO"];
    }
    if (indiceDoArrayDeOdfs === codigoOperArray.length - 1) {
        codigoMaquinaProxOdf = objOdfSelecionada["CODIGO_MAQUINA"];
        codMaqProxOdf = objOdfSelecionada["NUMERO_OPERACAO"];
        qntdeJaApontada = objOdfSelecionada["QTDE_APONTADA"];
        qtdLib = objOdfSelecAnterior["QTDE_APONTADA"];
        apontLib = objOdfSelecionada["APONTAMENTO_LIBERADO"];
    }
    if (indiceDoArrayDeOdfs > 0 && indiceDoArrayDeOdfs < codigoOperArray.length - 1) {
        codigoMaquinaProxOdf = objOdfSelecProximo["CODIGO_MAQUINA"];
        codMaqProxOdf = objOdfSelecProximo["NUMERO_OPERACAO"];
        qntdeJaApontada = objOdfSelecionada["QTDE_APONTADA"];
        qtdLib = objOdfSelecAnterior["QTDE_APONTADA"];
        apontLib = objOdfSelecionada["APONTAMENTO_LIBERADO"];
    }
    console.log('linha 108 ', dados.numOdf);
    console.log("linha 101", qtdLib);
    console.log("linha 102", qntdeJaApontada);
    if (qtdLib - qntdeJaApontada === 0) {
        return res.status(400).json({ message: "nolimitonlastodf" });
    }
    qtdLibMax = qtdLib - qntdeJaApontada;
    if (qtdLibMax <= 0 && apontLib === "N") {
        return res.status(400).redirect("/#/codigobarras?error=anotherodfexpected");
    }
    if (objOdfSelecAnterior === undefined) {
        await connection.query(`
            UPDATE 
            PCP_PROGRAMACAO_PRODUCAO 
            SET 
            APONTAMENTO_LIBERADO = 'S' 
            WHERE 1 = 1 
            AND NUMERO_ODF = '${dados.numOdf}' 
            AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' 
            AND CODIGO_MAQUINA = '${dados.codMaq}'`);
    }
    if (objOdfSelecAnterior === undefined) {
        objOdfSelecAnterior = 0;
    }
    let numeroOper = '00' + objOdfSelecionada.NUMERO_OPERACAO.replaceAll(" ", '0');
    if (objOdfSelecionada['CODIGO_MAQUINA'] === 'RET001') {
        objOdfSelecionada['CODIGO_MAQUINA'] = 'RET01';
    }
    res.cookie('qtdLibMax', qtdLibMax);
    res.cookie("MAQUINA_PROXIMA", codigoMaquinaProxOdf);
    res.cookie("OPERACAO_PROXIMA", codMaqProxOdf);
    res.cookie("NUMERO_ODF", objOdfSelecionada["NUMERO_ODF"]);
    res.cookie("CODIGO_PECA", objOdfSelecionada['CODIGO_PECA']);
    res.cookie("CODIGO_MAQUINA", objOdfSelecionada['CODIGO_MAQUINA']);
    res.cookie("NUMERO_OPERACAO", numeroOper);
    res.cookie("REVISAO", objOdfSelecionada['REVISAO']);
    const codApont = await connection.query(`
        SELECT TOP 1 CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND PECA = '${objOdfSelecionada.CODIGO_PECA}' AND ITEM = '${objOdfSelecionada.CODIGO_MAQUINA}'  ORDER BY DATAHORA DESC`.trim()).then(result => result.recordset);
    if (codApont.length < 0) {
        codApont[0].CODAPONTA = "0";
    }
    console.log("linha 156");
    if (codApont[0].CODAPONTA === 5) {
        return res.status(400).json({ message: "paradademaquina" });
    }
    console.log("linha 161");
    try {
        const resource2 = await connection.query(`
                        SELECT DISTINCT                 
                           OP.NUMITE,                 
                           CAST(OP.EXECUT AS INT) AS EXECUT,
                           CONDIC,       
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
        if (resource2.length > 0) {
            res.cookie("CONDIC", resource2[0].CONDIC);
            let codigoNumite = resource2.map(e => e.NUMITE);
            res.cookie("NUMITE", codigoNumite);
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
            let qtdTotal = calMaxQuant(execut, saldoReal);
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
            const updateQtyQuery = [];
            const updateQtyRes = [];
            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            }
            await connection.query(updateQtyQuery.join("\n"));
            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            }
            await connection.query(updateQtyRes.join("\n"));
            return res.status(200).redirect("/#/ferramenta?status=pdoesntexists");
        }
        if (resource2.length <= 0) {
            return res.status(200).json({ message: 'feito' });
        }
    }
    catch (error) {
        console.log('linha 236: ', error);
        return res.json({ message: "CATCH ERRO NO TRY" });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/apontamentoCracha")
    .post(async (req, res) => {
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
        if (selecionarMatricula.length <= 0) {
            return res.redirect("/#/codigobarras?error=invalidBadge");
        }
    }
    catch (error) {
        console.log(error);
        return res.redirect("/#/codigobarras?error=invalidBadge");
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/odf")
    .get(async (req, res) => {
    let numeroOdf = String(req.cookies["NUMERO_ODF"]);
    let numOper = String(req.cookies["NUMERO_OPERACAO"]);
    let numOpeNew = numOper.toString().replaceAll(' ', "0");
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT 
            * 
            FROM
            VW_APP_APTO_PROGRAMACAO_PRODUCAO
            WHERE 1 = 1 
            AND [NUMERO_ODF] = ${numeroOdf}
            AND [CODIGO_PECA] IS NOT NULL
            ORDER BY NUMERO_OPERACAO ASC`.trim()).then(result => result.recordset);
        res.cookie("qtdProduzir", resource[0].QTDE_ODF);
        let codigoOperArray = resource.map(e => e.NUMERO_OPERACAO);
        let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",");
        let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((e) => e === numOpeNew);
        let odfSelecionada = resource[indiceDoArrayDeOdfs];
        let qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA);
        let qtdOdfArray = resource.map(e => e.QTDE_ODF);
        let valorQtdOdf;
        let valorQtdeApontAnterior;
        let valorMaxdeProducao;
        if (indiceDoArrayDeOdfs - 1 <= 0) {
            valorQtdOdf = qtdOdfArray[indiceDoArrayDeOdfs - 1] || qtdOdfArray[indiceDoArrayDeOdfs];
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs - 1] || qtdeApontadaArray[indiceDoArrayDeOdfs];
            valorMaxdeProducao = valorQtdOdf - valorQtdeApontAnterior || 0;
        }
        if (indiceDoArrayDeOdfs > 0) {
            qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA);
            let x = qtdeApontadaArray[indiceDoArrayDeOdfs - 1];
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs];
            valorMaxdeProducao = x - valorQtdeApontAnterior || 0;
        }
        const obj = {
            odfSelecionada,
            valorMaxdeProducao,
        };
        if (obj.odfSelecionada === undefined || obj.odfSelecionada === null) {
            return res.status(400).json({ message: 'erro ao pegar o tempo' });
        }
        else {
            console.log("linha 336 /odf/ ", obj);
            return res.status(200).json(obj);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ message: "erro ao pegar o tempo" });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/imagem")
    .get(async (req, res) => {
    const numpec = req.cookies["CODIGO_PECA"];
    const revisao = req.cookies['REVISAO'];
    let statusImg = "_status";
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
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
            `).then(record => record.recordset);
        let imgResult = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
            imgResult.push(path);
        }
        if (imgResult.length <= 0) {
            return res.status(400).json({ message: 'Erro no servidor' });
        }
        else {
            console.log('linha 378 ok');
            return res.status(200).json(imgResult);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Erro no servidor." });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/status")
    .get(async (req, res) => {
    let numpec = req.cookies['CODIGO_PECA'];
    let maquina = req.cookies['CODIGO_MAQUINA'];
    let tempoAgora = new Date().getTime();
    let startTime = req.cookies['starterBarcode'];
    let startTimeNow = Number(new Date(startTime).getTime());
    let tempoDecorrido = Number(tempoAgora - startTimeNow);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT 
            TOP 1 
            EXECUT 
            FROM 
            OPERACAO 
            WHERE NUMPEC = '${numpec}' 
            AND MAQUIN = '${maquina}' 
            ORDER BY REVISAO DESC
            `).then(record => record.recordset);
        let qtdProd = req.cookies["qtdProduzir"][0];
        let tempoExecut = Number(resource[0].EXECUT);
        let tempoTotalExecução = Number(tempoExecut * qtdProd) * 1000;
        let tempoRestante = (tempoTotalExecução - tempoDecorrido);
        if (tempoRestante <= 0) {
            tempoRestante = 0;
        }
        console.log('linha 407: /status/ : ', tempoRestante);
        return res.status(200).json(tempoRestante);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Erro no servidor." });
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
    let codigoPeca = String(req.cookies["CODIGO_PECA"]);
    let numero_odf = String(req.cookies["NUMERO_ODF"]);
    let numeroOperacao = String(req.cookies["NUMERO_OPERACAO"]);
    let codigoMaq = String(req.cookies["CODIGO_MAQUINA"]);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let revisao = Number(req.cookies['REVISAO']);
    let ferramenta = String("_ferr");
    let start = String(req.cookies["starterBarcode"]);
    let qtdLibMax = Number(req.cookies['qtdLibMax']);
    let startTime = Number(new Date(start).getTime());
    try {
        const resource = await connection.query(`
                SELECT
                    [CODIGO],
                    [IMAGEM]
                FROM VIEW_APTO_FERRAMENTAL 
                WHERE 1 = 1 
                    AND IMAGEM IS NOT NULL
                    AND CODIGO = '${codigoPeca}'
            `).then(res => res.recordset);
        let result = [];
        for await (let [i, record] of resource.entries()) {
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'${funcionario}','${numero_odf}','${codigoPeca}','${revisao}','${numeroOperacao}','${numeroOperacao}', 'D','${codigoMaq}','${qtdLibMax}','0','0','${funcionario}','0','1', '1', 'Setup Ini.','${startTime}','${startTime}', '1', '0','0')`).then(result => result.recordset);
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
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let numero_odf = String(req.cookies['NUMERO_ODF']);
    let numeroOperacao = String(req.cookies['NUMERO_OPERACAO']);
    let codigoMaq = String(req.cookies['CODIGO_MAQUINA']);
    let codigoPeca = String(req.cookies["CODIGO_PECA"]);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let revisao = Number(req.cookies['REVISAO']);
    let qtdLibMax = Number(req.cookies['qtdLibMax']);
    let end = Number(new Date().getTime());
    let start = String(req.cookies['starterBarcode']);
    const startTime = Number(new Date(start).getTime());
    let tempoDecorrido = Number(end - startTime);
    let startProd = new Date().getTime();
    res.cookie("startProd", startProd);
    try {
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'${funcionario}','${numero_odf}','${codigoPeca}','${revisao}','${numeroOperacao}','${numeroOperacao}', 'D','${codigoMaq}','${qtdLibMax}','0','0','${funcionario}','0','2', '2', 'Setup Fin.','${tempoDecorrido}','${tempoDecorrido}', '1', '0','0')`).then(result => result.recordset);
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'${funcionario}','${numero_odf}','${codigoPeca}','${revisao}','${numeroOperacao}','${numeroOperacao}', 'D','${codigoMaq}','${qtdLibMax}','0','0','${funcionario}','0','3', '3', 'Ini Prod.','${startProd}','${startProd}', '1', '0','0')`).then(result => result.recordset);
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
    let qtdBoas = req.body['valorFeed'] || 0;
    let supervisor = req.body['supervisor'] || 0;
    let motivorefugo = req.body['value'] || null;
    let badFeed = req.body['badFeed'] || 0;
    let missingFeed = req.body['missingFeed'] || 0;
    let reworkFeed = req.body['reworkFeed'] || 0;
    let parcialFeed = req.body['parcialFeed'] || 0;
    var codigoFilho = req.cookies['codigoFilho'];
    var reservedItens = req.cookies['reservedItens'];
    let NUMERO_ODF = req.cookies["NUMERO_ODF"];
    let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"];
    let codigoPeca = req.cookies['CODIGO_PECA'];
    let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"];
    let qtdLibMax = req.cookies['qtdLibMax'];
    let condic = req.cookies['CONDIC'];
    let MAQUINA_PROXIMA = req.cookies['MAQUINA_PROXIMA'];
    let OPERACAO_PROXIMA = req.cookies['OPERACAO_PROXIMA'];
    let funcionario = req.cookies['FUNCIONARIO'];
    let revisao = Number(req.cookies['REVISAO']) || 0;
    const updateQtyQuery = [];
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input && input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }
    qtdBoas = sanitize(req.body["valorFeed"]) || 0;
    badFeed = sanitize(req.body["badFeed"]) || 0;
    missingFeed = sanitize(req.body["missingFeed"]) || 0;
    reworkFeed = sanitize(req.body["reworkFeed"]) || 0;
    parcialFeed = sanitize(req.body["parcialFeed"]) || 0;
    supervisor = sanitize(req.body["supervisor"]);
    motivorefugo = sanitize(req.body["value"]) || null;
    let startRip = new Date();
    console.log('startRip: ', startRip);
    res.cookie("startRip", startRip);
    let endProdTimer = new Date();
    let startProd = req.cookies["startProd"] / 1000;
    let finalProdTimer = endProdTimer.getTime() - startProd / 1000;
    let valorTotalApontado = parseInt(Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed) + Number(parcialFeed));
    if (motivorefugo === undefined) {
        motivorefugo = null;
    }
    if (valorTotalApontado > qtdLibMax) {
        return res.json({ message: 'valor apontado maior que a quantidade liberada' });
    }
    if (badFeed > 0) {
        const resource = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'
            `).then(result => result.recordset);
        if (resource.length <= 0) {
            return res.json({ message: 'supervisor não encontrado' });
        }
    }
    valorTotalApontado = Number(valorTotalApontado);
    qtdLibMax = Number(qtdLibMax);
    if (condic === undefined || condic === null) {
        condic = 0;
        codigoFilho = 0;
    }
    if (condic === 'P') {
        try {
            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
            }
            await connection.query(updateQtyQuery.join("\n"));
        }
        catch (err) {
            return res.json({ message: 'erro ao efetivar estoque das peças filhas ' });
        }
    }
    console.log('codigo Maq', CODIGO_MAQUINA);
    console.log('codigo Ope', NUMERO_OPERACAO);
    if (CODIGO_MAQUINA !== "EX002") {
        console.log("linha 648/");
        if (CODIGO_MAQUINA === 'ENG01') {
            console.log('não vai executar aqui linha 651');
            const s = await connection.query(`
                    SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('00240174-1') ORDER BY CE.ENDERECO ASC`).then(result => result.recordset);
            if (s.length > 0) {
                return res.json(s);
            }
            if (s.length <= 0) {
                console.log('não vai executar aqui linha 661');
                const e = await connection.query(`
                            SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                            LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                            WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('00240174-1') ORDER BY CE.ENDERECO ASC`).then(result => result.recordset);
                return res.json(e);
            }
        }
        if (CODIGO_MAQUINA === 'EX002') {
            console.log('vai executar aqui linha 670');
            const q = await connection.query(`
                    SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '7%' AND UPPER(EE.CODIGO) = UPPER('00240174') ORDER BY CE.ENDERECO ASC`).then(result => result.recordset);
            if (q.length > 0) {
                return res.json(q);
            }
            if (q.length <= 0) {
                console.log('vai executar aqui linha 680');
                const l = await connection.query(`
                    SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE ISNULL(EE.QUANTIDADE,0) <= 0 AND CE.ENDERECO LIKE '7%' ORDER BY CE.ENDERECO ASC`).then(result => result.recordset);
                return res.json(l);
            }
        }
        try {
            if (CODIGO_MAQUINA === 'EX002') {
                const updateProxOdfToS = await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 =1 AND CODIGO = '${codigoPeca}'`);
                console.log('updateProxOdfToS: ', updateProxOdfToS);
            }
            else {
                const updateProxOdfToS = await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 =1 AND CODIGO = '${codigoPeca}'`);
                console.log('updateProxOdfToS: linha 655 ', updateProxOdfToS);
            }
        }
        catch (error) {
            console.log(error);
            return res.json({ message: 'erro ao inserir estoque' });
        }
    }
    const hisReal = await connection.query(`SELECT TOP 1 SALDO FROM  HISREAL WHERE 1 = 1`).then(record => record.recordset);
    try {
        await connection.query(`
            SELECT E.CODIGO,CAST('${NUMERO_ODF}' + '/' + 'DATA HORA' AS VARCHAR(200)),
            '${qtdBoas}',
            MAX(VALPAGO),
            'E', ('${hisReal[0].SALDO}' + '${qtdBoas}'),
            GETDATE(),0,'${funcionario}','${NUMERO_ODF}',0,1,1,MAX(CUSTO_MEDIO),MAX(CUSTO_TOTAL),
            MAX(CUSTO_UNITARIO),MAX(CATEGORIA),MAX(E.DESCRI),1,MAX(E.UNIDADE),'S','N','APONTAMENTO',
            'VERSAO DO APONTAMENTO','47091','7C1501-04','${CODIGO_MAQUINA}' 
            FROM ESTOQUE E(NOLOCK)
            WHERE 1 = 1 
            AND E.CODIGO ='${codigoPeca}' GROUP BY E.CODIGO;`);
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro ao enviar o apontamento' });
    }
    try {
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        }
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`);
        }
        if (valorTotalApontado >= qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        }
        await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        await connection.query(`
            INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(), '${funcionario}' , '${NUMERO_ODF}' , '${codigoPeca}' , '${revisao}' , ${NUMERO_OPERACAO} ,${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '4' , '4', 'Fin Prod.' , '${finalProdTimer}' , '${finalProdTimer}' , '1', UPPER('${motivorefugo}') ,'0','0')`);
        return res.json({ message: 'valores apontados com sucesso' });
    }
    catch {
        return res.json({ message: 'erro ao enviar o apontamento' });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/rip")
    .get(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let numpec = String(req.cookies["CODIGO_PECA"]);
    let revisao = String(req.cookies['REVISAO']);
    let codMaq = String(req.cookies['CODIGO_MAQUINA']);
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
        let arrayNumope = resource.map((e) => {
            if (e.CST_NUMOPE === codMaq) {
                return e;
            }
        });
        let numopeFilter = arrayNumope.filter(e => e);
        res.cookie('cstNumope', numopeFilter.map(e => e.CST_NUMOPE));
        res.cookie('numCar', numopeFilter.map(e => e.NUMCAR));
        res.cookie('descricao', numopeFilter.map(e => e.DESCRICAO));
        res.cookie('especif', numopeFilter.map(e => e.ESPECIF));
        res.cookie('instrumento', numopeFilter.map(e => e.INSTRUMENTO));
        res.cookie('lie', numopeFilter.map(e => e.LIE));
        res.cookie('lse', numopeFilter.map(e => e.LSE));
        return res.json(numopeFilter);
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
    let codigoPeca = req.cookies['CODIGO_PECA'];
    let funcionario = req.cookies['FUNCIONARIO'];
    let revisao = req.cookies['REVISAO'];
    let qtdLibMax = req.cookies['qtdLibMax'];
    let setup = req.body['setup'];
    const updateQtyQuery = [];
    let especif = req.cookies['especif'];
    let numCar = req.cookies['numCar'];
    let lie = req.cookies['lie'];
    let lse = req.cookies['lse'];
    let instrumento = req.cookies['instrumento'];
    let descricao = req.cookies['descricao'];
    if (Object.keys(setup).length <= 0) {
        return res.json({ message: "rip vazia" });
    }
    let end = new Date().getTime();
    let start = req.cookies["starterBarcode"];
    let tempoDecorrido = Number(new Date(start).getTime());
    let final = Number(end - tempoDecorrido);
    let endProdRip = new Date().getDate();
    let startRip = req.cookies["startRip"];
    let tempoDecorridoRip = Number(new Date(startRip).getDate());
    let finalProdRip = Number(tempoDecorridoRip - endProdRip);
    await connection.query(`
            INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
        VALUES(GETDATE(), '${funcionario}', '${NUMERO_ODF}', '${codigoPeca}', '${revisao}', ${NUMERO_OPERACAO}, ${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}', '${qtdLibMax}', '0', '0', '${funcionario}', '0', '6', '6', 'Fin Prod.', '${finalProdRip}', '${finalProdRip}', '1', '0', '0')`);
    try {
        await connection.query(`
                    UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'ocorreu um erro ao enviar os dados da rip' });
    }
    const resultSplitLines = Object.keys(setup).reduce((acc, interator) => {
        const [col, lin] = interator.split("-");
        const value = setup[interator];
        if (acc[lin] === undefined)
            acc[lin] = {};
        acc[lin][col] = Number(value);
        return acc;
    }, {});
    Object.entries(resultSplitLines).forEach(([row], i) => {
        if (lie[i] === null) {
            lie[i] = 0;
        }
        if (lse[i] === null) {
            lse[i] = 0;
        }
        updateQtyQuery.push(`
            INSERT INTO 
            CST_RIP_ODF_PRODUCAO 
            (ODF, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
            VALUES('${NUMERO_ODF}','1', '${revisao}' , '${numCar[i]}', '${descricao[i]}',  '${especif[i]}','${lie[i]}', '${lse[i]}',${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `'${resultSplitLines[row].M2}'` : null},${resultSplitLines[row].M3 ? `'${resultSplitLines[row].M3}'` : null},${resultSplitLines[row].M4 ? `'${resultSplitLines[row].M4}'` : null},${resultSplitLines[row].M5 ? `'${resultSplitLines[row].M5}'` : null},${resultSplitLines[row].M6 ? `'${resultSplitLines[row].M6}'` : null},${resultSplitLines[row].M7 ? `'${resultSplitLines[row].M7}'` : null},${resultSplitLines[row].M8 ? `'${resultSplitLines[row].M8}'` : null},${resultSplitLines[row].M9 ? `'${resultSplitLines[row].M9}'` : null},${resultSplitLines[row].M10 ? `'${resultSplitLines[row].M10}'` : null},${resultSplitLines[row].M11 ? `'${resultSplitLines[row].M11}'` : null},${resultSplitLines[row].M12 ? `'${resultSplitLines[row].M12}'` : null},${resultSplitLines[row].M13 ? `'${resultSplitLines[row].M13}'` : null},'${instrumento[i]}','${CODIGO_MAQUINA}','${NUMERO_OPERACAO}')`);
    });
    await connection.query(updateQtyQuery.join("\n"));
    try {
        return res.json({ message: "rip enviada, odf finalizada" });
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "ocorreu um erro ao enviar os dados da rip" });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/returnedValue")
    .post(async (req, res) => {
    console.log(req.body);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let choosenOption = req.body['quantity'];
    let supervisor = req.body['supervisor'];
    console.log("choosenOption:  ", choosenOption);
    console.log("supervisor:  ", supervisor);
    req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
    let barcode = req.body["codigoBarras"];
    console.log("barcode: ", barcode);
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
    choosenOption = sanitize(req.body["quantity"]);
    supervisor = sanitize(req.body["supervisor"]);
    let funcionario = req.cookies['FUNCIONARIO'];
    const res1 = await connection.query(`
        SELECT TOP 1
                [NUMERO_ODF],
                [NUMERO_OPERACAO],
                [CODIGO_MAQUINA],
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
                [HORA_FIM],
                [REVISAO]
                FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO
                WHERE 1 = 1
                AND [NUMERO_ODF] = ${dados.numOdf}
                AND [CODIGO_MAQUINA] = '${dados.codMaq}'
                AND [NUMERO_OPERACAO] = ${dados.numOper}
                ORDER BY NUMERO_OPERACAO ASC`.trim()).then(result => result.recordset);
    if (res1.length > 0) {
        let codigoPeca = res1[0].CODIGO_PECA;
        let revisao = res1[0].REVISAO;
        let qtdLibMax = res1[0].QTDE_ODF;
        let faltante = '0';
        let retrabalhada = '0';
        const selectSuper = await connection.query(`
                    SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`).then(result => result.recordset);
        if (selectSuper.length > 0) {
            try {
                await connection.query(`
                    INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
                    VALUES(GETDATE(),'CESAR','1444591','15990007','1','80','80', 'D','QUA002','1','0','0','CESAR','0','7', '7', 'Valor Estorn.','0.566','0.655', '1', '0','0')
                    `);
                return res.status(200).json({ message: 'estorno feito' });
            }
            catch (error) {
                console.log(error);
            }
            finally {
                await connection.close();
            }
            return res.status(400).redirect("/#/codigobarras?error=returnederror");
        }
    }
    else {
        return res.status(400).redirect("/#/codigobarras?error=returnederror");
    }
});
apiRouter.route("/supervisor")
    .post(async (req, res) => {
    let supervisor = String(req.body['supervisor']);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
        if (resource.length > 0) {
            return res.status(200).json({ message: 'supervisor encontrado' });
        }
        else {
            return res.status(400).json({ message: 'supervisor não encontrado' });
        }
    }
    catch (error) {
        return res.status(400);
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/supervisorParada")
    .post(async (req, res) => {
    let supervisor = String(req.body['supervisor']);
    let numeroOdf = String(req.cookies['NUMERO_ODF']);
    let NUMERO_OPERACAO = String(req.cookies['NUMERO_OPERACAO']);
    let CODIGO_MAQUINA = String(req.cookies['CODIGO_MAQUINA']);
    let qtdLibMax = String(req.cookies['qtdLibMax']);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let revisao = Number(req.cookies['REVISAO']) || 0;
    let codigoPeca = String(req.cookies['CODIGO_PECA']);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const resource = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
        if (resource.length > 0) {
            await connection.query(`
                INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
                VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${NUMERO_OPERACAO} ,${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '3' , '3', 'Fin Prod.' , '0' , '0' , '1' ,'0','0')`);
            return res.status(200).json({ success: 'maquina' });
        }
        else {
            return res.status(400).json();
        }
    }
    catch (error) {
        return res.status(400);
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
        return res.status(200).json(resoc);
    }
    catch (error) {
        return res.status(500).json();
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/postParada")
    .post(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let numeroOdf = String(req.cookies["NUMERO_ODF"]);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let codigoPeca = req.cookies['CODIGO_PECA'];
    let revisao = Number(req.cookies['REVISAO']) || 0;
    let numeroOperacao = req.cookies['NUMERO_OPERACAO'];
    let codigoMaq = req.cookies['CODIGO_MAQUINA'];
    let qtdLibMax = req.cookies['qtdLibMax'];
    let end = new Date().getTime();
    let start = req.cookies["starterBarcode"];
    let newStart = Number(new Date(start).getTime());
    let final = end - newStart;
    try {
        await connection.query(`
                INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
                VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${numeroOperacao} ,${numeroOperacao}, 'D', '${codigoMaq}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '5' , '5', 'Parada.' , '${final}' , '${final}' , '1' ,'0','0')`);
        return res.status(200).json({ message: 'maquina parada com sucesso' });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ message: "ocorre um erro ao tentar parar a maquina" });
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
            SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
        let resoc = resource.map(e => e.DESCRICAO);
        return res.status(200).json(resoc);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ message: 'erro em motivos de refugo' });
    }
    finally {
        await connection.close();
    }
});
apiRouter.route("/desenho")
    .get(async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const revisao = Number(req.cookies['REVISAO']) || 0;
    const numpec = String(req.cookies["CODIGO_PECA"]);
    let desenho = "_desenho";
    if (revisao === 0) {
        console.log("object");
    }
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