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
    if (queryGrupoOdf.length <= 0) {
        return res.status(400).redirect("/#/codigobarras");
    }
    let codigoOperArray = queryGrupoOdf.map(e => e.NUMERO_OPERACAO);
    let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",");
    let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((e) => e === dados.numOper);
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
    console.log('qtdLib linha 98: ', qtdLib);
    console.log('qntdeJaApontada linha 99: ', qntdeJaApontada);
    if (indiceDoArrayDeOdfs > 0 && apontLib === "N") {
        return res.status(400).redirect("/#/codigobarras?error=anotherodfexpected");
    }
    if (qtdLib - qntdeJaApontada === 0) {
        return res.status(400).redirect("/#/codigobarras?error=nolimitonlastodf");
    }
    qtdLibMax = qtdLib - qntdeJaApontada;
    if (!objOdfSelecAnterior) {
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
    let numeroOper = '00' + objOdfSelecionada.NUMERO_OPERACAO.replaceAll(" ", '0');
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
    if (codApont[0].CODAPONTA === 5) {
        return res.status(400).redirect("/#/codigobarras?error=paradademaquina");
    }
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
        console.log('resource2: ', resource2);
    }
    catch (error) {
        return res.redirect("/#/codigobarras");
    }
    finally {
        await connection.close();
        return res.redirect("/#/ferramenta");
    }
});
apiRouter.route("/apontamentoCracha")
    .post(async (req, res) => {
    let MATRIC = req.body["MATRIC"].trim();
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
        const selecionarMatricula = await connection.query(` 
            SELECT TOP 1 [MATRIC], [FUNCIONARIO] FROM FUNCIONARIOS WHERE 1 = 1 AND [MATRIC] = '${MATRIC}'
                `.trim()).then(result => result.recordset);
        console.log(selecionarMatricula);
        if (selecionarMatricula.length > 0) {
            let start = new Date();
            let mili = start.getMilliseconds() / 1000;
            res.cookie("starterBarcode", mili);
            res.cookie("MATRIC", selecionarMatricula[0].MATRIC);
            res.cookie("FUNCIONARIO", selecionarMatricula[0].FUNCIONARIO);
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
        let objOdfSelecionada = resource[indiceDoArrayDeOdfs];
        let qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA);
        let qtdOdfArray = resource.map(e => e.QTDE_ODF);
        let valorQtdOdf;
        let valorQtdeApontAnterior;
        let valorMaxdeProducao;
        if (indiceDoArrayDeOdfs - 1 <= 0) {
            valorQtdOdf = qtdOdfArray[indiceDoArrayDeOdfs - 1] || qtdOdfArray[indiceDoArrayDeOdfs];
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs - 1] || qtdeApontadaArray[indiceDoArrayDeOdfs];
            valorMaxdeProducao = valorQtdOdf - valorQtdeApontAnterior;
        }
        if (indiceDoArrayDeOdfs > 0) {
            qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA);
            let x = qtdeApontadaArray[indiceDoArrayDeOdfs - 1];
            valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs];
            valorMaxdeProducao = x - valorQtdeApontAnterior;
        }
        const obj = {
            objOdfSelecionada,
            valorMaxdeProducao,
        };
        res.json(obj);
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
    const revisao = req.cookies['REVISAO'];
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
        console.log('imgResult: ', imgResult);
        return res.json(imgResult);
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
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let tempoInicio = req.cookies["starterBarcode"];
    let numpec = req.cookies['CODIGO_PECA'];
    let maquina = req.cookies['CODIGO_MAQUINA'];
    let tempoAgora = new Date();
    let newEnd = tempoAgora.getMilliseconds() / 1000;
    try {
        const resource = await connection.query(`
            SELECT TOP 1 EXECUT FROM OPERACAO WHERE NUMPEC = '${numpec}' AND MAQUIN = '${maquina}' ORDER BY REVISAO DESC
            `).then(record => record.recordset);
        let qtdProd = req.cookies["qtdProduzir"][0];
        let resultadoEmSegundos = resource[0].EXECUT * 1000;
        let tempoTotalExecução = resultadoEmSegundos * qtdProd;
        let tempoFinal = newEnd - tempoInicio;
        let tempoTotal = tempoTotalExecução - tempoFinal;
        return res.json(tempoTotal);
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
            VALUES(GETDATE(),'CESAR','1444591','15990007','1','80','80', 'D','QUA002','1','0','0','CESAR','0','1', '1', 'Setup Ini.','0.566','0.655', '1', '0','0')`).then(result => result.recordset);
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
    console.log("object");
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let numero_odf = String(req.cookies['NUMERO_ODF']);
    let numeroOperacao = String(req.cookies['NUMERO_OPERACAO']);
    let codigoMaq = String(req.cookies['CODIGO_MAQUINA']);
    let codigoPeca = String(req.cookies["CODIGO_PECA"]);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    let revisao = Number(req.cookies['REVISAO']);
    let qtdLibMax = Number(req.cookies['qtdLibMax']);
    let end = new Date();
    let newEnd = end.getMilliseconds() / 1000;
    let start = req.cookies["starterBarcode"];
    let final = newEnd - start;
    let startProd = new Date();
    let newStartProd = startProd.getMilliseconds() / 1000;
    res.cookie("startProd", newStartProd);
    try {
        await connection.query(`
            INSERT INTO 
            HISAPONTA
            (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'${funcionario}','${numero_odf}','${codigoPeca}','${revisao}',${numeroOperacao},${numeroOperacao}, 'D','${codigoMaq}','${qtdLibMax}','0','0','${funcionario}','0','2', '2', 'Setup Fin.','${final}','${final}', '1', '0','0')`);
        await connection.query(`
            INSERT INTO 
            HISAPONTA
            (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'${funcionario}','${numero_odf}','${codigoPeca}','${revisao}',${numeroOperacao},${numeroOperacao}, 'D','${codigoMaq}','${qtdLibMax}','0','0','${funcionario}','0','3', '3', 'Ini Prod.','${newStartProd}','${newStartProd}', '1', '0','0')`)
            .then(result => result.recordset);
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
    let mili = startRip.getMilliseconds() / 1000;
    res.cookie("startRip", mili);
    let endProdTimer = new Date();
    let startProd = req.cookies["startProd"] / 1000;
    let finalProdTimer = endProdTimer.getTime() - startProd / 1000;
    let valorTotalApontado = parseInt(Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed) + Number(parcialFeed));
    if (motivorefugo === undefined) {
        motivorefugo = null;
    }
    console.log('valorTotalApontado;  ', valorTotalApontado);
    console.log('qtdLibMax;  ', qtdLibMax);
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
    try {
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        }
        if (valorTotalApontado <= qtdLibMax) {
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
    let codigoPeca = req.cookies['CODIGO_PECA'];
    let SETUP = req.body.SETUP.trim();
    let funcionario = req.cookies['FUNCIONARIO'];
    let revisao = req.cookies['REVISAO'];
    let qtdLibMax = req.cookies['qtdLibMax'];
    let M2 = req.body["M2"].trim();
    let M3 = req.body["M3"].trim();
    let M4 = req.body["M4"].trim();
    let M5 = req.body["M5"].trim();
    let M6 = req.body["M6"].trim();
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input && input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
    }
    SETUP = sanitize(req.body.SETUP);
    let end = new Date();
    let newNemEnd = Number(end.getMilliseconds() / 1000);
    let start = req.cookies["starterBarcode"];
    let final = Number(newNemEnd - start);
    let endProdRip = new Date();
    let newendProdRip = Number(endProdRip.getMilliseconds() / 1000);
    let startRip = req.cookies["startRip"];
    let finalProdRip = Number(newendProdRip - startRip);
    await connection.query(`
            INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(), '${funcionario}' , '${NUMERO_ODF}' , '${codigoPeca}' , '${revisao}' , ${NUMERO_OPERACAO} ,${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '6' , '6', 'Fin Prod.' , '${final}' , '${final}' , '1' ,'0','0')`);
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
                return res.status(200).redirect("/#/codigobarras?status=returnedsucess");
            }
            catch (error) {
                console.log(error);
                return res.status(400).redirect("/#/codigobarras?error=returnederror");
            }
            finally {
                await connection.close();
            }
        }
        else {
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
            return res.status(200).json();
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
    let end = new Date();
    let newNemEnd = end.getMilliseconds() / 1000;
    let start = req.cookies["starterBarcode"];
    let final = newNemEnd - start;
    try {
        await connection.query(`
                INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
                VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${numeroOperacao} ,${numeroOperacao}, 'D', '${codigoMaq}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '5' , '5', 'Parada.' , '${final}' , '${final}' , '1' ,'0','0')`);
        return res.status(200).json();
    }
    catch (error) {
        console.log(error);
        return res.status(400).json();
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
        return console.log(error);
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