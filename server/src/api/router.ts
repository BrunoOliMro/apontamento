import { Router } from "express";
//import assert from "node:assert";
import mssql from "mssql";
import { sqlConfig } from "../global.config";
import { pictures } from "./pictures";

const apiRouter = Router();
// /api/v1/
apiRouter.route("/apontamento")
    .post(async (req, res) => {
        req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
        let barcode = req.body["codigoBarras"]

        //Sanitização
        function sanitize(input: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }

        //Verifica se o codigo de barras veio vazio
        if (barcode == '') {
            res.status(400).redirect("/#/codigobarras?error=invalidBarcode")
        }

        //Divide o Codigo de barras em 3 partes para a verificação na proxima etapa
        const dados = {
            numOdf: Number(barcode.slice(10)),
            numOper: String(barcode.slice(0, 5)),
            codMaq: String(barcode.slice(5, 10)),
        }
        //Reatribuiu o codigo caso o cado de barras seja maior
        if (barcode.length > 17) {
            dados.numOdf = barcode.slice(11)
            dados.numOper = barcode.slice(0, 5)
            dados.codMaq = barcode.slice(5, 11)
        }

        //Seleciona todos os itens da Odf
        const connection = await mssql.connect(sqlConfig);
        const queryGrupoOdf = await connection.query(`
        SELECT 
        * 
        FROM
        VW_APP_APTO_PROGRAMACAO_PRODUCAO
        WHERE 1 = 1 
        AND [NUMERO_ODF] = ${dados.numOdf}
        AND [CODIGO_PECA] IS NOT NULL
        ORDER BY NUMERO_OPERACAO ASC
                        `.trim()
        ).then(result => result.recordset)

        if (queryGrupoOdf.length <= 0) {
            return res.status(400).redirect("/#/codigobarras")
        }

        //Map pelo numero da operação e diz o indice de uma odf antes e uma depois
        let codigoOperArray = queryGrupoOdf.map(e => e.NUMERO_OPERACAO)
        let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",")
        let indiceDoArrayDeOdfs: number = arrayAfterMap.findIndex((e: string) => e === dados.numOper)
        let objOdfSelecionada = queryGrupoOdf[indiceDoArrayDeOdfs]
        let objOdfSelecProximo = queryGrupoOdf[indiceDoArrayDeOdfs + 1]
        let objOdfSelecAnterior = queryGrupoOdf[indiceDoArrayDeOdfs - 1]
        let qtdLib: number = 0
        let apontLib: string = ''
        let qntdeJaApontada: number = 0
        let qtdLibMax: number = 0
        let codigoMaquinaProxOdf;
        let codMaqProxOdf;

        //Verifica caso o indice seja o primeiro e caso seja seta a quantidade liberada para a quantidade da odf seleciona
        if (indiceDoArrayDeOdfs === 0) {
            codigoMaquinaProxOdf = objOdfSelecProximo["CODIGO_MAQUINA"]
            codMaqProxOdf = objOdfSelecProximo["NUMERO_OPERACAO"]
            qntdeJaApontada = objOdfSelecionada["QTDE_APONTADA"]
            qtdLib = objOdfSelecionada["QTDE_ODF"]
            apontLib = objOdfSelecionada["APONTAMENTO_LIBERADO"]
        }

        //Se for o ultimo indice do array
        if (indiceDoArrayDeOdfs === codigoOperArray.length - 1) {
            codigoMaquinaProxOdf = objOdfSelecionada["CODIGO_MAQUINA"]
            codMaqProxOdf = objOdfSelecionada["NUMERO_OPERACAO"]
            qntdeJaApontada = objOdfSelecionada["QTDE_APONTADA"]
            qtdLib =  objOdfSelecAnterior["QTDE_APONTADA"]
            apontLib = objOdfSelecionada["APONTAMENTO_LIBERADO"]
        }

        //Se o indice for maior que zero essa operação pega a quantidade liberada na odf anterior e pega a letra e a quantidade já apontada da sua propria odf
        if (indiceDoArrayDeOdfs > 0 && indiceDoArrayDeOdfs < codigoOperArray.length - 1) {
            codigoMaquinaProxOdf = objOdfSelecProximo["CODIGO_MAQUINA"]
            codMaqProxOdf = objOdfSelecProximo["NUMERO_OPERACAO"]
            qntdeJaApontada = objOdfSelecionada["QTDE_APONTADA"]
            qtdLib = objOdfSelecAnterior["QTDE_APONTADA"]
            apontLib = objOdfSelecionada["APONTAMENTO_LIBERADO"]
        }


        console.log('qtdLib linha 98: ',qtdLib);
        console.log('qntdeJaApontada linha 99: ',qntdeJaApontada);
        //Se a odf não for a primeira e a quantidade liberada for 0 não é a odf da vez a ser enviada
        if (indiceDoArrayDeOdfs > 0 && apontLib === "N") {
            return res.status(400).redirect("/#/codigobarras?error=anotherodfexpected")
        }

        if (qtdLib - qntdeJaApontada === 0) {
            return res.status(400).redirect("/#/codigobarras?error=nolimitonlastodf")
        }
        qtdLibMax = qtdLib - qntdeJaApontada

        // Caso seja a primeira Odf, objOdfSelecAnterior vai vir como undefined
        if (!objOdfSelecAnterior) {
            await connection.query(`
            UPDATE 
            PCP_PROGRAMACAO_PRODUCAO 
            SET 
            APONTAMENTO_LIBERADO = 'S' 
            WHERE 1 = 1 
            AND NUMERO_ODF = '${dados.numOdf}' 
            AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' 
            AND CODIGO_MAQUINA = '${dados.codMaq}'`)
        }

        let numeroOper = '00' + objOdfSelecionada.NUMERO_OPERACAO.replaceAll(" ", '0')

        res.cookie('qtdLibMax', qtdLibMax)
        res.cookie("MAQUINA_PROXIMA", codigoMaquinaProxOdf)
        res.cookie("OPERACAO_PROXIMA", codMaqProxOdf)
        res.cookie("NUMERO_ODF", objOdfSelecionada["NUMERO_ODF"])
        res.cookie("CODIGO_PECA", objOdfSelecionada['CODIGO_PECA'])
        res.cookie("CODIGO_MAQUINA", objOdfSelecionada['CODIGO_MAQUINA'])
        res.cookie("NUMERO_OPERACAO", numeroOper)
        res.cookie("REVISAO", objOdfSelecionada['REVISAO'])

        const codApont = await connection.query(`
        SELECT TOP 1 CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND PECA = '${objOdfSelecionada.CODIGO_PECA}' AND ITEM = '${objOdfSelecionada.CODIGO_MAQUINA}'  ORDER BY DATAHORA DESC`.trim()
        ).then(result => result.recordset)

        if (codApont[0].CODAPONTA === 5) {
            return res.status(400).redirect("/#/codigobarras?error=paradademaquina")
        }

        try {
            //Seleciona as peças filhas, a quantidade para execução e o estoque dos itens
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
                        `.trim()
            ).then(result => result.recordset)
            console.log('resource2: ',resource2);
            // if (resource2.length > 0) {
            //     res.cookie("CONDIC", resource2[0].CONDIC)
            //     let codigoNumite = resource2.map(e => e.NUMITE)
            //     res.cookie("NUMITE", codigoNumite)
            //     /**
            //      * Calcula quantas peças pai podem ser produzidas com o estoque atual de componentes
            //      */
            //     function calMaxQuant(qtdNecessPorPeca: number[], saldoReal: number[]): number {
            //         // Quantas peças pai o estoque do componente poderia produzir
            //         const pecasPaiPorComponente = qtdNecessPorPeca.map((qtdPorPeca, i) => {
            //             return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
            //         });

            //         const qtdMaxProduzivel = pecasPaiPorComponente.reduce((qtdMax, pecasPorComp) => {
            //             return Math.min(qtdMax, pecasPorComp);
            //         }, Infinity);

            //         Math.round(qtdMaxProduzivel)
            //         return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
            //     }

            //     //Map na quantidade de itens para execução e map do estoque
            //     const execut = resource2.map(item => item.EXECUT);
            //     const saldoReal = resource2.map(item => item.SALDOREAL);

            //     let qtdTotal = calMaxQuant(execut, saldoReal);

            //     //Retorna um array com a quantidade de itens total da execução
            //     const reservedItens = execut.map((quantItens) => {
            //         return Math.floor((qtdTotal || 0) * quantItens)
            //     }, Infinity)
            //     res.cookie("reservedItens", reservedItens)
            //     const codigoFilho = resource2.map(item => item.NUMITE)
            //     res.cookie("codigoFilho", codigoFilho)

            //     let qtdProdOdf: Number = Number(resource2[0].QTDE_ODF)
            //     let resultadoFinalProducao: Number = Number(Number(qtdTotal) - Number(qtdProdOdf))
            //     if (resultadoFinalProducao <= 0) {
            //         resultadoFinalProducao = 0
            //         return resultadoFinalProducao
            //     }
            //     res.cookie("resultadoFinalProducao", resultadoFinalProducao)
            //     // Loop para atualizar os dados no DB
            //     const updateQtyQuery = [];
            //     const updateQtyRes = [];

            //     for (const [i, qtdItem] of reservedItens.entries()) {
            //         updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            //     }
            //     await connection.query(updateQtyQuery.join("\n"));


            //     for (const [i, qtdItem] of reservedItens.entries()) {
            //         updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}';`);
            //     }
            //     await connection.query(updateQtyRes.join("\n"));
            //     return res.status(400).redirect("/#/ferramenta?status=pdoesntexists")
            // }
        } catch (error) {
            return res.redirect("/#/codigobarras")
        } finally {
            await connection.close()
            return res.redirect("/#/ferramenta")
        }
    })

apiRouter.route("/apontamentoCracha")
    .post(async (req, res) => {
        let MATRIC: string = req.body["MATRIC"].trim()

        //Sanitizar codigo
        function sanitize(input: String) {
            const allowedChars = /[A-Za-z0-9]/;
            return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }

        MATRIC = sanitize(MATRIC)

        if (MATRIC == '') {
            res.status(400).redirect("/#/codigobarras?error=invalidBadge")
        }

        const connection = await mssql.connect(sqlConfig);
        try {
            const selecionarMatricula = await connection.query(` 
            SELECT TOP 1 [MATRIC], [FUNCIONARIO] FROM FUNCIONARIOS WHERE 1 = 1 AND [MATRIC] = '${MATRIC}'
                `.trim()
            ).then(result => result.recordset)
            console.log(selecionarMatricula);
            if (selecionarMatricula.length > 0) {
                let start = new Date();
                let mili = start.getMilliseconds() / 1000;
                res.cookie("starterBarcode", mili)
                res.cookie("MATRIC", selecionarMatricula[0].MATRIC)
                res.cookie("FUNCIONARIO", selecionarMatricula[0].FUNCIONARIO)
                res.status(200).redirect("/#/codigobarras?status=ok")
            } else {
                res.status(404).redirect("/#/codigobarras?error=invalidBadge")
            }
        } catch (error) {
            res.status(404).redirect("/#/codigobarras?error=invalidBadge")
        } finally {
            await connection.close()
        }
    });

apiRouter.route("/odf")
    .get(async (req, res) => {
        let numeroOdf: string = String(req.cookies["NUMERO_ODF"])
        let numOper: string = String(req.cookies["NUMERO_OPERACAO"])
        let numOpeNew = numOper.toString().replaceAll(' ', "0")
        const connection = await mssql.connect(sqlConfig);
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
            res.cookie("qtdProduzir", resource[0].QTDE_ODF)
            let codigoOperArray = resource.map(e => e.NUMERO_OPERACAO)
            let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",")
            let indiceDoArrayDeOdfs: number = arrayAfterMap.findIndex((e: string) => e === numOpeNew)
            let objOdfSelecionada = resource[indiceDoArrayDeOdfs]
            let qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA)
            let qtdOdfArray = resource.map(e => e.QTDE_ODF)
            let valorQtdOdf;
            let valorQtdeApontAnterior;
            let valorMaxdeProducao;

            //Caso seja o primeiro indice do array
            if (indiceDoArrayDeOdfs - 1 <= 0) {
                valorQtdOdf = qtdOdfArray[indiceDoArrayDeOdfs - 1] || qtdOdfArray[indiceDoArrayDeOdfs]
                valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs - 1] || qtdeApontadaArray[indiceDoArrayDeOdfs]
                valorMaxdeProducao = valorQtdOdf - valorQtdeApontAnterior;
            }

            //Para os demais do array
            if (indiceDoArrayDeOdfs > 0) {
                qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA)
                let x = qtdeApontadaArray[indiceDoArrayDeOdfs - 1]
                valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs]
                valorMaxdeProducao = x - valorQtdeApontAnterior
            }

            //Obj que retorna ao front
            const obj = {
                objOdfSelecionada,
                valorMaxdeProducao,
            }

            res.json(obj);
        } catch (error) {
            console.log(error);
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/imagem")
    .get(async (req, res) => {
        const numpec: string = req.cookies["CODIGO_PECA"]
        const revisao: string = req.cookies['REVISAO']
        const connection = await mssql.connect(sqlConfig);
        let statusImg = "_status"
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
                const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
                imgResult.push(path);
            }
            console.log('imgResult: ',imgResult);
            return res.json(imgResult)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

apiRouter.route("/status")
    .get(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let tempoInicio = req.cookies["starterBarcode"]
        let numpec = req.cookies['CODIGO_PECA']
        let maquina = req.cookies['CODIGO_MAQUINA']
        let tempoAgora = new Date();
        let newEnd = tempoAgora.getMilliseconds() / 1000;
        console.log(newEnd);
        try {
            const resource = await connection.query(`
            SELECT TOP 1 EXECUT FROM OPERACAO WHERE NUMPEC = '${numpec}' AND MAQUIN = '${maquina}' ORDER BY REVISAO DESC
            `).then(record => record.recordset)
            //res.cookie("Tempo Execucao", resource[0].EXECUT) 
            let qtdProd = req.cookies["qtdProduzir"][0]
            //valor em segundos
            let resultadoEmSegundos: number = resource[0].EXECUT * 1000
            //valor vezes a quantidade de peças
            let tempoTotalExecução: number = resultadoEmSegundos * qtdProd
            let tempoFinal = newEnd - tempoInicio
            let tempoTotal: number = tempoTotalExecução - tempoFinal
            console.log(tempoTotal);
            res.json(tempoTotal)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

apiRouter.route("/HISTORICO")
    .get(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let NUMERO_ODF: String = req.cookies["NUMERO_ODF"]
        try {
            const resource = await connection.query(`
            SELECT
            *
            FROM VW_APP_APONTAMENTO_HISTORICO
            WHERE 1 = 1
            AND ODF = '${NUMERO_ODF}'
            ORDER BY OP ASC
            `.trim()).then(result => result.recordset)
            return res.json(resource)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

apiRouter.route("/ferramenta")
    //GET das Fotos das desenhodiv
    .get(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let codigoPeca: string = String(req.cookies["CODIGO_PECA"])
        let numero_odf: string = String(req.cookies["NUMERO_ODF"])
        let numeroOperacao: string = String(req.cookies["NUMERO_OPERACAO"])
        let codigoMaq: string = String(req.cookies["CODIGO_MAQUINA"])
        let funcionario: string = String(req.cookies['FUNCIONARIO'])
        let revisao: number = Number(req.cookies['REVISAO'])
        let ferramenta: string = String("_ferr")
        let start: string = String(req.cookies["starterBarcode"])
        let qtdLibMax: number = Number(req.cookies['qtdLibMax'])

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
                const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
                result.push(path);
            }

            //Cria o primeiro registro em Hisaponta e insere o CODAPONTA 1 e o primeiro tempo em APT_TEMPO_OPERACAO
            await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'CESAR','1444591','15990007','1','80','80', 'D','QUA002','1','0','0','CESAR','0','1', '1', 'Setup Ini.','0.566','0.655', '1', '0','0')`).then(result => result.recordset)
            return res.status(200).json(result);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

apiRouter.route("/ferselecionadas")
    .get(async (req, res) => {
        console.log("object");
        const connection = await mssql.connect(sqlConfig);
        let numero_odf: string = String(req.cookies['NUMERO_ODF'])
        let numeroOperacao: string = String(req.cookies['NUMERO_OPERACAO'])
        let codigoMaq: string = String(req.cookies['CODIGO_MAQUINA'])
        let codigoPeca: string = String(req.cookies["CODIGO_PECA"])
        let funcionario: string = String(req.cookies['FUNCIONARIO'])
        let revisao: number = Number(req.cookies['REVISAO'])
        let qtdLibMax: number = Number(req.cookies['qtdLibMax'])

        //Encerra o primeiro tempo de setup
        let end = new Date();
        let newEnd = end.getMilliseconds() / 1000;
        let start = req.cookies["starterBarcode"]
        let final: number = newEnd - start

        //Inicia a produção
        let startProd = new Date();
        let newStartProd: number = startProd.getMilliseconds() / 1000
        res.cookie("startProd", newStartProd)
        try {
            //INSERE EM CODAPONTA 2
            await connection.query(`
            INSERT INTO 
            HISAPONTA
            (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'${funcionario}','${numero_odf}','${codigoPeca}','${revisao}',${numeroOperacao},${numeroOperacao}, 'D','${codigoMaq}','${qtdLibMax}','0','0','${funcionario}','0','2', '2', 'Setup Fin.','${final}','${final}', '1', '0','0')`)

            //INSERE EM CODAPONTA 3
            await connection.query(`
            INSERT INTO 
            HISAPONTA
            (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'${funcionario}','${numero_odf}','${codigoPeca}','${revisao}',${numeroOperacao},${numeroOperacao}, 'D','${codigoMaq}','${qtdLibMax}','0','0','${funcionario}','0','3', '3', 'Ini Prod.','${newStartProd}','${newStartProd}', '1', '0','0')`)
                .then(result => result.recordset)
            return res.status(200).json()
        } catch (error) {
            console.log(error)
            return res.status(400).redirect("/#/ferramenta")
        } finally {
            await connection.close()
        }
    })


apiRouter.route("/apontar")
    .post(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let qtdBoas = req.body['valorFeed'] || 0;
        let supervisor = req.body['supervisor'] || 0
        let motivorefugo = req.body['value'] || null
        let badFeed = req.body['badFeed'] || 0
        let missingFeed = req.body['missingFeed'] || 0
        let reworkFeed = req.body['reworkFeed'] || 0
        let parcialFeed = req.body['parcialFeed'] || 0
        var codigoFilho = req.cookies['codigoFilho']
        var reservedItens: number[] = req.cookies['reservedItens']
        let NUMERO_ODF = req.cookies["NUMERO_ODF"]
        let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"]
        let codigoPeca = req.cookies['CODIGO_PECA']
        let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"]
        let qtdLibMax = req.cookies['qtdLibMax']
        let condic = req.cookies['CONDIC']
        let MAQUINA_PROXIMA = req.cookies['MAQUINA_PROXIMA']
        let OPERACAO_PROXIMA = req.cookies['OPERACAO_PROXIMA']
        let funcionario = req.cookies['FUNCIONARIO']
        let revisao: number = Number(req.cookies['REVISAO']) || 0

        //Sanitização de input
        function sanitize(input?: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input && input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }

        qtdBoas = sanitize(req.body["valorFeed"]) || 0;
        badFeed = sanitize(req.body["badFeed"]) || 0;
        missingFeed = sanitize(req.body["missingFeed"]) || 0;
        reworkFeed = sanitize(req.body["reworkFeed"]) || 0;
        parcialFeed = sanitize(req.body["parcialFeed"]) || 0;
        supervisor = sanitize(req.body["supervisor"])
        motivorefugo = sanitize(req.body["value"]) || null

        //Inicia tempo de Rip
        let startRip = new Date();
        let mili: number = startRip.getMilliseconds() / 1000;
        res.cookie("startRip", mili)

        //Encerra o tempo da produção
        let endProdTimer = new Date();
        let startProd = req.cookies["startProd"] / 1000
        let finalProdTimer = endProdTimer.getTime() - startProd / 1000;

        let valorTotalApontado: number = parseInt(Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed) + Number(parcialFeed))

        if (motivorefugo === undefined) {
            motivorefugo = null
        }

        console.log('valorTotalApontado;  ', valorTotalApontado);
        console.log('qtdLibMax;  ', qtdLibMax);

        //Verifica se a quantidade apontada mão é maior que a quantidade maxima liberada
        if (valorTotalApontado > qtdLibMax) {
            return res.json({ message: 'valor apontado maior que a quantidade liberada' })
        }

        //Verifica se existe o Supervisor
        if (badFeed > 0) {
            const resource = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'
            `).then(result => result.recordset);
            if (resource.length <= 0) {
                return res.json({ message: 'supervisor não encontrado' })
            }
        }
        valorTotalApontado = Number(valorTotalApontado)
        qtdLibMax = Number(qtdLibMax)


        try {
            //Verifica caso a quantidade seja menor que o valor(assim a produção foi menor que o desejado), e deixa um "S" em apontamento liberado para um possivel apontamento futuro
            if (valorTotalApontado < qtdLibMax) {
                await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
            }
            //Verifica o valor e sendo acima de 0 ele libera um "S" no proximo processo
            if (valorTotalApontado <= qtdLibMax) {
                await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`)
            }

            //Verifica caso a quantidade apontada pelo usuario seja maior ou igual ao numero que poderia ser lançado, assim lanca um "N" em apontamento para bloquear um proximo apontamento
            if (valorTotalApontado >= qtdLibMax) {
                await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
            }

            //Seta quantidade apontada da odf para o quanto o usuario diz ser(PCP_PROGRAMACAO_PRODUCAO)
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)

            // Insere o CODAPONTA 4, O tempo de produção e as quantidades boas, ruins, retrabalhadas e faltantes(HISAPONTA) 
            await connection.query(`
            INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(), '${funcionario}' , '${NUMERO_ODF}' , '${codigoPeca}' , '${revisao}' , ${NUMERO_OPERACAO} ,${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '4' , '4', 'Fin Prod.' , '${finalProdTimer}' , '${finalProdTimer}' , '1', UPPER('${motivorefugo}') ,'0','0')`)
            // //Caso a operação seja 999 fara baixa no estoque
            // NUMERO_OPERACAO = String(NUMERO_OPERACAO)
            // if (NUMERO_OPERACAO === "999") {
            //     // const updateProxOdfToS = await connection.query(`UPDATE CST_ALOCACAO SET QUANTIDADE = '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
            // }

            // if (condic === undefined || condic === null) {
            //     condic = 0;
            //     codigoFilho = 0;
            // }

            //Caso haja "P" faz update na quantidade de peças dos filhos
            // if (condic === 'P') {
            //     try {
            //         // Loop para atualizar os dados no DB
            //         const updateQtyQuery = [];
            //         //const updateQtyRes = [];
            //         for (const [i, qtdItem] of reservedItens.entries()) {
            //             updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
            //         }
            //         const res = await connection.query(updateQtyQuery.join("\n"))
            //         console.log('res:  ', res);

            //         // for (const [i, qtdItem] of reservedItens.entries()) {
            //         //     updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
            //         // }
            //         // const resultQuery = await connection.query(updateQtyRes.join("\n")).then(result => result.recordset);
            //         // console.log('resultQuery: ', resultQuery);
            //     } catch (err) {
            //         return res.status(400).redirect("/#/codigobarras/apontamento")
            //     }
            // }
            return res.json({ message: 'valores apontados com sucesso' })
        } catch {
            return res.json({ message: 'erro ao enviar o apontamento' })
        } finally {
            await connection.close()
        }
    }
    )

apiRouter.route("/rip")
    .get(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let numpec: string = String(req.cookies["CODIGO_PECA"])
        let revisao: string = String(req.cookies['REVISAO'])

        //Inicia tempo de Rip
        let startRip = new Date();
        let ripMiliseg: number = Number(startRip.getMilliseconds() / 1000);
        res.cookie("startRip", ripMiliseg)
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
                `.trim()
            ).then(result => result.recordset)
            return res.json(resource)
        } catch (error) {
            console.log(error)
            return res.status(400).redirect("/#/codigobarras/apontamento?error=ripnotFound")
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/lancamentoRip")
    .post(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let NUMERO_ODF = req.cookies['NUMERO_ODF']
        let NUMERO_OPERACAO = req.cookies['NUMERO_OPERACAO']
        let CODIGO_MAQUINA = req.cookies['CODIGO_MAQUINA']
        let codigoPeca = req.cookies['CODIGO_PECA']
        let SETUP = req.body.SETUP.trim()
        let funcionario = req.cookies['FUNCIONARIO']
        let revisao = req.cookies['REVISAO']
        let qtdLibMax = req.cookies['qtdLibMax']
        let M2 = req.body["M2"].trim()
        let M3 = req.body["M3"].trim()
        let M4 = req.body["M4"].trim()
        let M5 = req.body["M5"].trim()
        let M6 = req.body["M6"].trim()
        // let M7 = req.body["M7"].trim()
        // let M8 = req.body["M8"].trim()
        // let M9 = req.body["M9"].trim()
        // let M10 = req.body["M10"].trim()
        // let M11 = req.body["M11"].trim()
        // let M12 = req.body["M12"].trim()
        // let M13 = req.body["M13"].trim()

        function sanitize(input?: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input && input
                .split("")
                .map((char) => (allowedChars.test(char) ? char : ""))
                .join("");
        }
        SETUP = sanitize(req.body.SETUP)

        //Encerra o processo todo
        let end = new Date();
        let newNemEnd: number = Number(end.getMilliseconds() / 1000);
        let start: number = req.cookies["starterBarcode"]
        let final: number = Number(newNemEnd - start)

        // Encerra ao final da Rip
        let endProdRip = new Date();
        let newendProdRip: number = Number(endProdRip.getMilliseconds() / 1000);
        let startRip: number = req.cookies["startRip"]
        let finalProdRip: number = Number(newendProdRip - startRip)

        //Insere O CODAPONTA 6 e Tempo da rip
        await connection.query(`
            INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(), '${funcionario}' , '${NUMERO_ODF}' , '${codigoPeca}' , '${revisao}' , ${NUMERO_OPERACAO} ,${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '6' , '6', 'Fin Prod.' , '${final}' , '${final}' , '1' ,'0','0')`)

        try {
            const resource = await connection.query('INSERT INTO CST_RIP_ODF_PRODUCAO(SETUP, M2,M3,M4,M5,M6) VALUES ('
                + SETUP + ','
                + M2 + ','
                + M3 + ','
                + M4 + ','
                + M5 + ','
                + M6 +
                ')').then(result => result.recordset)
            console.log(resource)
            res.json(resource)
        } catch (error) {
            console.log(error)
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/returnedValue")
    .post(async (req, res) => {
        console.log(req.body)
        const connection = await mssql.connect(sqlConfig);
        let choosenOption = req.body['quantity']
        let supervisor = req.body['supervisor']
        console.log("choosenOption:  ", choosenOption);
        console.log("supervisor:  ", supervisor);

        req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
        let barcode = req.body["codigoBarras"]
        console.log("object");

        //Sanitização
        function sanitize(input: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }

        //Verifica se o codigo de barras veio vazio
        if (barcode == '') {
            res.status(400).redirect("/#/codigobarras?error=invalidBarcode")
        }


        //Divide o Codigo de barras em 3 partes para a verificação na proxima etapa
        const dados = {
            numOdf: Number(barcode.slice(10)),
            numOper: String(barcode.slice(0, 5)),
            codMaq: String(barcode.slice(5, 10)),
        }
        //Reatribuiu o codigo caso o cado de barras seja maior
        if (barcode.length > 17) {
            dados.numOdf = barcode.slice(11)
            dados.numOper = barcode.slice(0, 5)
            dados.codMaq = barcode.slice(5, 11)
        }

        choosenOption = sanitize(req.body["quantity"])
        supervisor = sanitize(req.body["supervisor"])
        let funcionario = req.cookies

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
            let codigoPeca = res1[0].CODIGO_PECA
            let revisao = res1[0].REVISAO
            let qtdLibMax = res1[0].QTDE_ODF
            let faltante = '0'
            let retrabalhada = '0'
            const selectSuper = await connection.query(`
                    SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`).then(result => result.recordset);
            if (selectSuper.length > 0) {
                try {
                    await connection.query(`
                                INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
                                VALUES(GETDATE(), '${funcionario}' , '${dados.numOdf}' , '${codigoPeca}' , '${revisao}' , ${dados.numOper} ,${dados.numOper}, 'D', '${dados.codMaq}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '7' , '7', 'Valor Est.' , '1' ,'${faltante}','${retrabalhada}')`)
                    return res.status(200).redirect("/#/codigobarras?status=returnedsucess")
                } catch (error) {
                    console.log(error)
                    return res.status(400).redirect("/#/codigobarras?error=returnederror")
                } finally {
                    await connection.close()
                }
            } else {
                return res.status(400).redirect("/#/codigobarras?error=returnederror")
            }
        } else {
            return res.status(400).redirect("/#/codigobarras?error=returnederror")
        }
    })

apiRouter.route("/supervisor")
    .post(async (req, res) => {
        let supervisor: string = String(req.body['supervisor'])
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
            if (resource.length > 0) {
                return res.status(200).json()
            } else {
                return res.status(400).json()
            }
        } catch (error) {
            return res.status(400)
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/supervisorParada")
    .post(async (req, res) => {
        let supervisor: string = String(req.body['supervisor'])
        let numeroOdf: string = String(req.cookies['NUMERO_ODF'])
        let NUMERO_OPERACAO: string = String(req.cookies['NUMERO_OPERACAO'])
        let CODIGO_MAQUINA: string = String(req.cookies['CODIGO_MAQUINA'])
        let qtdLibMax: string = String(req.cookies['qtdLibMax'])
        let funcionario: string = String(req.cookies['FUNCIONARIO'])
        let revisao: number = Number(req.cookies['REVISAO']) || 0
        let codigoPeca: string = String(req.cookies['CODIGO_PECA'])
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
            if (resource.length > 0) {
                await connection.query(`
                INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
                VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${NUMERO_OPERACAO} ,${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '3' , '3', 'Fin Prod.' , '0' , '0' , '1' ,'0','0')`)
                return res.status(200).json({ success: 'maquina' })
            } else {
                return res.status(400).json()
            }
        } catch (error) {
            return res.status(400)
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/motivoParada")
    .get(async (_req, res) => {
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
                SELECT CODIGO,DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
            let resoc = resource.map(e => e.DESCRICAO)
            return res.status(200).json(resoc)
        } catch (error) {
            return res.status(500).json()
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/postParada")
    .post(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let numeroOdf: string = String(req.cookies["NUMERO_ODF"])
        let funcionario: string = String(req.cookies['FUNCIONARIO'])
        let codigoPeca = req.cookies['CODIGO_PECA']
        let revisao: number = Number(req.cookies['REVISAO']) || 0
        let numeroOperacao = req.cookies['NUMERO_OPERACAO']
        let codigoMaq = req.cookies['CODIGO_MAQUINA']
        let qtdLibMax = req.cookies['qtdLibMax']

        //Encerra o processo todo
        let end = new Date();
        let newNemEnd: number = end.getMilliseconds() / 1000;
        let start = req.cookies["starterBarcode"]
        let final: number = newNemEnd - start
        try {
            //Insere O CODAPONTA 5
            await connection.query(`
                INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
                VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${numeroOperacao} ,${numeroOperacao}, 'D', '${codigoMaq}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '5' , '5', 'Parada.' , '${final}' , '${final}' , '1' ,'0','0')`)
            return res.status(200).json()
        } catch (error) {
            console.log(error)
            return res.status(400).json()
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/motivorefugo")
    .get(async (_req, res) => {
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
            SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
            let resoc = resource.map(e => e.DESCRICAO)
            return res.status(200).json(resoc)
        } catch (error) {
            return console.log(error)
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/desenho")
    //GET Desenho TECNICO
    .get(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        const revisao: number = Number(req.cookies['REVISAO']) || 0
        const numpec: string = String(req.cookies["CODIGO_PECA"])
        let desenho = "_desenho"
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
                AND IMAGEM IS NOT NULL`).then(res => res.recordset)
            let imgResult = [];
            for await (let [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], desenho, String(i));
                imgResult.push(path);
            }
            return res.status(200).json(imgResult);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

export default apiRouter;