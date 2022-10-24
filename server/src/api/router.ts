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
            return res.status(400).redirect("/#/codigobarras?error=invalidBarcode")
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

        //console.log('linha 38 ', dados.numOdf)
        // console.log(dados.numOper)
        // console.log(dados.codMaq)

        //Seleciona todos os itens da Odf
        const connection = await mssql.connect(sqlConfig);
        const queryGrupoOdf = await connection.query(`
        SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' ORDER BY NUMERO_OPERACAO ASC
        `.trim()
        ).then(result => result.recordset)

        if (queryGrupoOdf.length <= 0) {
            return res.json({ message: "okkk" })
        }

        //Map pelo numero da operação e diz o indice de uma odf antes e uma depois
        let codigoOperArray = queryGrupoOdf.map(e => e.NUMERO_OPERACAO)
        let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",")
        let indiceDoArrayDeOdfs: number = arrayAfterMap.findIndex((e: string) => e === dados.numOper)

        if (indiceDoArrayDeOdfs < 0) {
            indiceDoArrayDeOdfs = 0
        }
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
            qtdLib = objOdfSelecAnterior["QTDE_APONTADA"]
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

        // console.log('linha 108 ', dados.numOdf)
        // console.log("linha 101", qtdLib);
        // console.log("linha 102", qntdeJaApontada);
        if (qtdLib - qntdeJaApontada === 0) {
            return res.status(400).json({ message: "nolimitonlastodf" })
        }
        qtdLibMax = qtdLib - qntdeJaApontada

        if (qtdLibMax <= 0 && apontLib === "N") {
            return res.status(400).redirect("/#/codigobarras?error=anotherodfexpected")
        }
        // Caso seja a primeira Odf, objOdfSelecAnterior vai vir como undefined
        if (objOdfSelecAnterior === undefined) {
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

        if (objOdfSelecAnterior === undefined) {
            objOdfSelecAnterior = 0
        }

        //console.log("linha 119", objOdfSelecAnterior);

        let numeroOper = '00' + objOdfSelecionada.NUMERO_OPERACAO.replaceAll(" ", '0')

        if (objOdfSelecionada['CODIGO_MAQUINA'] === 'RET001') {
            objOdfSelecionada['CODIGO_MAQUINA'] = 'RET01'
        }

        //console.log('codigoMaq:',codigoMaq);
        res.cookie('qtdLibMax', qtdLibMax)
        res.cookie("MAQUINA_PROXIMA", codigoMaquinaProxOdf)
        res.cookie("OPERACAO_PROXIMA", codMaqProxOdf)
        res.cookie("NUMERO_ODF", objOdfSelecionada["NUMERO_ODF"])
        res.cookie("CODIGO_PECA", objOdfSelecionada['CODIGO_PECA'])
        res.cookie("CODIGO_MAQUINA", objOdfSelecionada['CODIGO_MAQUINA'])
        res.cookie("NUMERO_OPERACAO", numeroOper)
        res.cookie("REVISAO", objOdfSelecionada['REVISAO'])
        // console.log('LINHA 136', objOdfSelecionada.CODIGO_PECA);
        // console.log('LINHA 136', dados.numOdf)
        // console.log('LINHA 136', objOdfSelecionada.CODIGO_MAQUINA);
        // console.log("linha 135");
        const codApont = await connection.query(`
        SELECT TOP 1 CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND PECA = '${objOdfSelecionada.CODIGO_PECA}' AND ITEM = '${objOdfSelecionada.CODIGO_MAQUINA}'  ORDER BY DATAHORA DESC`.trim()
        ).then(result => result.recordset)

        if (codApont.length < 0) {
            codApont[0].CODAPONTA = "0"
        }
        // console.log("linha 156");

        if (codApont[0].CODAPONTA === 5) {
            return res.status(400).json({ message: "paradademaquina" })
        }

        // console.log("linha 161");
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
            if (resource2.length > 0) {
                res.cookie("CONDIC", resource2[0].CONDIC)
                let codigoNumite = resource2.map(e => e.NUMITE)
                res.cookie("NUMITE", codigoNumite)
                /**
                 * Calcula quantas peças pai podem ser produzidas com o estoque atual de componentes
                 */
                function calMaxQuant(qtdNecessPorPeca: number[], saldoReal: number[]): number {
                    // Quantas peças pai o estoque do componente poderia produzir
                    const pecasPaiPorComponente = qtdNecessPorPeca.map((qtdPorPeca, i) => {
                        return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
                    });

                    const qtdMaxProduzivel = pecasPaiPorComponente.reduce((qtdMax, pecasPorComp) => {
                        return Math.min(qtdMax, pecasPorComp);
                    }, Infinity);

                    Math.round(qtdMaxProduzivel)
                    return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
                }

                //Map na quantidade de itens para execução e map do estoque
                const execut = resource2.map(item => item.EXECUT);
                const saldoReal = resource2.map(item => item.SALDOREAL);

                let qtdTotal = calMaxQuant(execut, saldoReal);

                //Retorna um array com a quantidade de itens total da execução
                const reservedItens = execut.map((quantItens) => {
                    return Math.floor((qtdTotal || 0) * quantItens)
                }, Infinity)
                res.cookie("reservedItens", reservedItens)
                const codigoFilho = resource2.map(item => item.NUMITE)
                res.cookie("codigoFilho", codigoFilho)

                let qtdProdOdf: Number = Number(resource2[0].QTDE_ODF)
                let resultadoFinalProducao: Number = Number(Number(qtdTotal) - Number(qtdProdOdf))
                if (resultadoFinalProducao <= 0) {
                    resultadoFinalProducao = 0
                    return resultadoFinalProducao
                }
                res.cookie("resultadoFinalProducao", resultadoFinalProducao)
                // Loop para atualizar os dados no DB
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
                return res.status(200).redirect("/#/ferramenta?status=pdoesntexists")
            }

            if (resource2.length <= 0) {
                return res.status(200).json({ message: 'feito' })
            }
        } catch (error) {
            console.log('linha 236: ', error);
            return res.json({ message: "CATCH ERRO NO TRY" })
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/apontamentoCracha")
    .post(async (req, res) => {
        let MATRIC: string = req.body["MATRIC"]

        if (MATRIC === undefined || MATRIC === null) {
            MATRIC = '0'
        }
        //Sanitizar codigo
        function sanitize(input: String) {
            const allowedChars = /[A-Za-z0-9]/;
            return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }

        MATRIC = sanitize(MATRIC)

        if (MATRIC == '') {
            return res.redirect("/#/codigobarras?error=invalidBadge")
        }

        const connection = await mssql.connect(sqlConfig);
        try {
            const selecionarMatricula = await connection.query(` 
            SELECT TOP 1 [MATRIC], [FUNCIONARIO] FROM FUNCIONARIOS WHERE 1 = 1 AND [MATRIC] = '${MATRIC}'
                `.trim()
            ).then(result => result.recordset)
            if (selecionarMatricula.length > 0) {
                let start = new Date();
                res.cookie("starterBarcode", start)
                res.cookie("MATRIC", selecionarMatricula[0].MATRIC)
                res.cookie("FUNCIONARIO", selecionarMatricula[0].FUNCIONARIO)
                return res.redirect("/#/codigobarras?status=ok")
            }
            if (!selecionarMatricula) {
                return res.redirect("/#/codigobarras?error=invalidBadge")
            }
        } catch (error) {
            console.log(error)
            return res.redirect("/#/codigobarras?error=invalidBadge")
        } finally {
            //await connection.close()
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
            ORDER BY NUMERO_OPERACAO ASC`.trim()).then(record => record.recordset);
            res.cookie("qtdProduzir", resource[0].QTDE_ODF)
            let codigoOperArray = resource.map(e => e.NUMERO_OPERACAO)
            let arrayAfterMap = codigoOperArray.map(e => "00" + e).toString().replaceAll(' ', "0").split(",")
            let indiceDoArrayDeOdfs: number = arrayAfterMap.findIndex((e: string) => e === numOpeNew)
            let odfSelecionada = resource[indiceDoArrayDeOdfs]
            let qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA)
            let qtdOdfArray = resource.map(e => e.QTDE_ODF)
            let valorQtdOdf;
            let valorQtdeApontAnterior;
            let valorMaxdeProducao;

            //Caso seja o primeiro indice do array
            if (indiceDoArrayDeOdfs - 1 <= 0) {
                valorQtdOdf = qtdOdfArray[indiceDoArrayDeOdfs - 1] || qtdOdfArray[indiceDoArrayDeOdfs]
                valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs - 1] || qtdeApontadaArray[indiceDoArrayDeOdfs]
                valorMaxdeProducao = valorQtdOdf - valorQtdeApontAnterior || 0;
            }

            //Para os demais do array
            if (indiceDoArrayDeOdfs > 0) {
                qtdeApontadaArray = resource.map(e => e.QTDE_APONTADA)
                let x = qtdeApontadaArray[indiceDoArrayDeOdfs - 1]
                valorQtdeApontAnterior = qtdeApontadaArray[indiceDoArrayDeOdfs]
                valorMaxdeProducao = x - valorQtdeApontAnterior || 0
            }

            //Obj que retorna ao front
            const obj = {
                odfSelecionada,
                valorMaxdeProducao,
            }

            if (obj.odfSelecionada === undefined || obj.odfSelecionada === null) {
                return res.json({ message: 'erro ao pegar o tempo' });
            } else {
                //console.log("linha 336 /odf/ ", obj);
                return res.status(200).json(obj);
            }

        } catch (error) {
            console.log(error);
            return res.json({ message: "erro ao pegar o tempo" });
        } finally {
            // await connection.close()
        }
    })

apiRouter.route("/imagem")
    .get(async (req, res) => {
        const numpec: string = req.cookies["CODIGO_PECA"]
        const revisao: string = req.cookies['REVISAO']
        let statusImg = "_status"
        const connection = await mssql.connect(sqlConfig);
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
                const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
                imgResult.push(path);
            }
            console.log("img", imgResult);
            if (!imgResult) {
                return res.json({ message: 'Erro no servidor' })
            } else {
                console.log('linha 378 ok');
                return res.status(200).json(imgResult)
            }

        } catch (error) {
            console.log(error)
            return res.json({ error: true, message: "Erro no servidor." });
        } finally {
            //await connection.close()
        }
    });

apiRouter.route("/status")
    .get(async (req, res) => {
        let numpec = req.cookies['CODIGO_PECA']
        let maquina = req.cookies['CODIGO_MAQUINA']
        let tempoAgora = new Date().getTime()
        let startTime = req.cookies['starterBarcode']
        let startTimeNow: number = Number(new Date(startTime).getTime());
        let tempoDecorrido: number = Number(tempoAgora - startTimeNow);
        const connection = await mssql.connect(sqlConfig);
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
            `).then(record => record.recordset)
            //res.cookie("Tempo Execucao", resource[0].EXECUT) 
            let qtdProd = req.cookies["qtdProduzir"][0]
            //valor em segundos
            let tempoExecut: number = Number(resource[0].EXECUT)
            //valor vezes a quantidade de peças
            let tempoTotalExecução: number = Number(tempoExecut * qtdProd) * 1000
            let tempoRestante = (tempoTotalExecução - tempoDecorrido)
            if (tempoRestante <= 0) {
                tempoRestante = 0
            }
            if (tempoRestante <= 0) {
                return res.json({ message: 'erro no tempo' })
            } else {
                console.log('linha 407: /status/ : ', tempoRestante);
                return res.status(200).json(tempoRestante)
            }
        } catch (error) {
            console.log(error)
            return res.json({ error: true, message: "Erro no servidor." });
        } finally {
            //await connection.close()
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

            if (resource.length <= 0) {
                return res.json({ error: true, message: "Erro no servidor." });
            } else {
                return res.json(resource)
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            //await connection.close()
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
        let startTime: number = Number(new Date(start).getTime());

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

            // if(codigoMaq === 'RET001'){
            //     codigoMaq = 'RET01'
            // }
            // //console.log('codigoMaq:',codigoMaq);
            // console.log("revisao", revisao);
            // console.log("numero_odf", numero_odf);
            // console.log("funcionario", funcionario);
            // console.log("codigoPeca", codigoPeca);
            // console.log("numeroOperacao", numeroOperacao);
            // console.log("qtdLibMax", qtdLibMax);
            // console.log("startTime", startTime);
            // console.log("codigoMaq", codigoMaq);

            // //Cria o primeiro registro em Hisaponta e insere o CODAPONTA 1 e o primeiro tempo em APT_TEMPO_OPERACAO
            const query = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
            VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '1', '1', 'Ini Set.', ${startTime}, ${startTime}, '1', '0', '0' )`).then(record => record.recordsets)
            console.log("query linha 515: ", query);

            // console.log('queryInser0t linha 509 ', queryInsertCod);
            // console.log('queryInsert linha 510 ', queryInsertCod.length);
            if (query === undefined) {
                return res.json({ message: "Erro nas ferramentas." });
            } else {
                return res.status(200).json(result);
            }
            // }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            // await connection.close()
        }
    });

apiRouter.route("/ferselecionadas")
    .get(async (req, res) => {
        let numero_odf: string = String(req.cookies['NUMERO_ODF'])
        let numeroOperacao: string = String(req.cookies['NUMERO_OPERACAO'])
        let codigoMaq: string = String(req.cookies['CODIGO_MAQUINA'])
        let codigoPeca: string = String(req.cookies["CODIGO_PECA"])
        let funcionario: string = String(req.cookies['FUNCIONARIO'])
        let revisao: number = Number(req.cookies['REVISAO'])
        let qtdLibMax: number = Number(req.cookies['qtdLibMax'])

        //Encerra o primeiro tempo de setup
        let end: number = Number(new Date().getTime());
        let start: string = String(req.cookies['starterBarcode'])
        const startTime: number = Number(new Date(start).getTime());
        let tempoDecorrido: number = Number(end - startTime)

        //Inicia a produção
        let startProd = new Date().getTime();
        res.cookie("startProd", startProd)
        const connection = await mssql.connect(sqlConfig);
        try {

            // console.log('startProd linha: ', startProd);
            // console.log('tempoDecorrido linha: ', tempoDecorrido);
            // console.log('funcionario linha: ', funcionario);
            // console.log('numero_odf linha: ', numero_odf);
            // console.log('codigoPeca linha: ', codigoPeca);
            // console.log('revisao linha: ', revisao);
            // console.log('numeroOperacao linha: ', numeroOperacao);
            // console.log('codigoMaq linha: ', codigoMaq);

            //INSERE EM CODAPONTA 2
            const query = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
            VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '2', '2', 'Fin Set.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.rowsAffected)
            console.log("query linha 572 : ", query);

            // //INSERE EM CODAPONTA 3
            const InsertCodTwo = await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) 
            VALUES (GETDATE(), '${funcionario}', '${numero_odf}', '${codigoPeca}', '${revisao}', '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, '0', '0', '${funcionario}', '0', '3', '3', 'Ini Prod.', ${tempoDecorrido}, ${tempoDecorrido}, '1', '0', '0' )`).then(record => record.rowsAffected)
            console.log("InsertCodTwo linha 577 : ", InsertCodTwo);

            if (!query) {
                return res.json({ message: "erro em ferselecionadas" })
            } else {
                return res.status(200).json({ message: 'ferramentas selecionadas com successo' })
            }
        } catch (error) {
            console.log(error)
            return res.redirect("/#/ferramenta")
        } finally {
            // await connection.close()
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
        let NUMERO_ODF: number = Number(req.cookies["NUMERO_ODF"])
        let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"]
        let codigoPeca = req.cookies['CODIGO_PECA']
        let CODIGO_MAQUINA: string = String(req.cookies["CODIGO_MAQUINA"])
        console.log("codigo: ", CODIGO_MAQUINA);
        let qtdLibMax = req.cookies['qtdLibMax']
        let condic = req.cookies['CONDIC']
        let MAQUINA_PROXIMA = req.cookies['MAQUINA_PROXIMA']
        let OPERACAO_PROXIMA = req.cookies['OPERACAO_PROXIMA']
        let funcionario = req.cookies['FUNCIONARIO']
        let revisao: number = Number(req.cookies['REVISAO']) || 0
        const updateQtyQuery = [];

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
        //console.log('startRip: ', startRip);
        res.cookie("startRip", startRip)

        //Encerra o tempo da produção
        let endProdTimer = new Date();
        let startProd = req.cookies["startProd"] / 1000
        let finalProdTimer = endProdTimer.getTime() - startProd / 1000;

        let valorTotalApontado: number = parseInt(Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed) + Number(parcialFeed))

        if (motivorefugo === undefined) {
            motivorefugo = null
        }

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

        if (condic === undefined || condic === null) {
            condic = 0;
            codigoFilho = 0;
        }

        //Caso haja "P" faz update na quantidade de peças dos filhos
        if (condic === 'P') {
            try {
                // Loop para atualizar os dados no DB
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                }
                await connection.query(updateQtyQuery.join("\n"))
            } catch (err) {
                return res.json({ message: 'erro ao efetivar estoque das peças filhas ' })
            }
        }
        console.log('codigo Ope', NUMERO_OPERACAO);

        if (CODIGO_MAQUINA === 'RET01') {
            CODIGO_MAQUINA = 'RET001'
        }
        console.log('codigo Maq', CODIGO_MAQUINA);

        //Caso a operação seja 999 fará baixa no estoque
        if (CODIGO_MAQUINA === "EX002") {
            console.log("linha 648/");
            //Caso seja diferente de "EX"
            if (CODIGO_MAQUINA === 'ENG01') {
                console.log('não vai executar aqui linha 651');
                const s = await connection.query(`
                    SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('00240174-1') ORDER BY CE.ENDERECO ASC`).then(result => result.recordset)
                if (s.length > 0) {
                    return res.json(s)
                }

                if (s.length <= 0) {
                    console.log('não vai executar aqui linha 661');
                    const e = await connection.query(`
                            SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                            LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                            WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('00240174-1') ORDER BY CE.ENDERECO ASC`).then(result => result.recordset)
                    return res.json(e)
                }
            }

            //Caso seja igual de "EX"
            if (CODIGO_MAQUINA === 'EX002') {
                console.log('vai executar aqui linha 670');
                // const q = await connection.query(`
                //     SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                //     LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                //     WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '7%' AND UPPER(EE.CODIGO) = UPPER('00240174') ORDER BY CE.ENDERECO ASC`).then(result => result.recordset)
                // if (q.length > 0) {
                //     return res.json(q)
                // }

                // if (q.length <= 0) {
                //     console.log('vai executar aqui linha 680');
                //     const l = await connection.query(`
                //     SELECT EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE FROM CST_CAD_ENDERECOS CE(NOLOCK)
                //     LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                //     WHERE ISNULL(EE.QUANTIDADE,0) <= 0 AND CE.ENDERECO LIKE '7%' ORDER BY CE.ENDERECO ASC`).then(result => result.recordset)
                //     return res.json(l)
                // }
            }

            try {
                if (CODIGO_MAQUINA === 'EX002') {
                    console.log("baixa no estoque");
                    const updateProxOdfToS = await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 =1 AND CODIGO = '${codigoPeca}'`)
                    console.log('updateProxOdfToS: ', updateProxOdfToS);
                } else {
                    const updateProxOdfToS = await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 =1 AND CODIGO = '${codigoPeca}'`)
                    console.log('updateProxOdfToS: linha 655 ', updateProxOdfToS);
                }
            } catch (error) {
                console.log(error);
                return res.json({ message: 'erro ao inserir estoque' })
            }
        }

        const hisReal = await connection.query(`SELECT TOP 1 SALDO FROM  HISREAL WHERE 1 = 1`).then(record => record.recordset)
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
            AND E.CODIGO ='${codigoPeca}' GROUP BY E.CODIGO;`)
        } catch (error) {
            console.log(error);
            return res.json({ message: 'erro ao enviar o apontamento' })
        }

        try {
            //Verifica caso a quantidade seja menor que o valor(assim a produção foi menor que o desejado), e deixa um "S" em apontamento liberado para um possivel apontamento futuro
            if (valorTotalApontado < qtdLibMax) {
                await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
            }
            //Verifica o valor e sendo acima de 0 ele libera um "S" no proximo processo
            if (valorTotalApontado < qtdLibMax) {
                await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`)
            }

            //Verifica caso a quantidade apontada pelo usuario seja maior ou igual ao numero que poderia ser lançado, assim lanca um "N" em apontamento para bloquear um proximo apontamento
            if (valorTotalApontado >= qtdLibMax) {
                await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
            }

            //Seta quantidade apontada da odf para o quanto o usuario diz ser(PCP_PROGRAMACAO_PRODUCAO)
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)

            console.log("ivghbwr", NUMERO_ODF);
            console.log('numer', CODIGO_MAQUINA);

            // Insere o CODAPONTA 4, O tempo de produção e as quantidades boas, ruins, retrabalhadas e faltantes(HISAPONTA) 
            // await connection.query(`
            // INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            // VALUES(GETDATE(),'${funcionario}', 1444592, '${codigoPeca}','1','${NUMERO_OPERACAO}','${NUMERO_OPERACAO}', 'D','${CODIGO_MAQUINA}',${qtdLibMax},0,0,'${funcionario}','0','4', '4', 'Fin Prod.',0.566,0.655, '1', 'UPPER('${motivorefugo}')',  0,0)
            // `)

            await connection.query(` INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(),'${funcionario}',${NUMERO_ODF},'${codigoPeca}','${revisao}','${NUMERO_OPERACAO}','${NUMERO_OPERACAO}', 'D','QUA002','1',${qtdBoas},${badFeed},'${funcionario}','0','4', '4', 'Fin Prod.',${finalProdTimer},${finalProdTimer}, '1',  UPPER('${motivorefugo}') , ${missingFeed},${reworkFeed})`)

            return res.json({ message: 'valores apontados com sucesso' })
        } catch (error) {
            console.log(error);
            return res.json({ message: 'erro ao enviar o apontamento' })
        } finally {
            //await connection.close()
        }
    }
    )

apiRouter.route("/rip")
    .get(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let numpec: string = String(req.cookies["CODIGO_PECA"])
        let revisao: string = String(req.cookies['REVISAO'])
        let codMaq: string = String(req.cookies['CODIGO_MAQUINA'])
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

            let arrayNumope = resource.map((e) => {
                if (e.CST_NUMOPE === codMaq) {
                    return e
                }
            })

            let numopeFilter = arrayNumope.filter(e => e)
            res.cookie('cstNumope', numopeFilter.map(e => e.CST_NUMOPE))
            res.cookie('numCar', numopeFilter.map(e => e.NUMCAR))
            res.cookie('descricao', numopeFilter.map(e => e.DESCRICAO))
            res.cookie('especif', numopeFilter.map(e => e.ESPECIF))
            res.cookie('instrumento', numopeFilter.map(e => e.INSTRUMENTO))
            res.cookie('lie', numopeFilter.map(e => e.LIE))
            res.cookie('lse', numopeFilter.map(e => e.LSE))
            return res.json(numopeFilter)
        } catch (error) {
            console.log(error)
            return res.status(400).redirect("/#/codigobarras/apontamento?error=ripnotFound")
        } finally {
            //await connection.close()
        }
    })

apiRouter.route("/lancamentoRip")
    .post(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let NUMERO_ODF = req.cookies['NUMERO_ODF']
        let NUMERO_OPERACAO = req.cookies['NUMERO_OPERACAO']
        let CODIGO_MAQUINA = req.cookies['CODIGO_MAQUINA']
        let codigoPeca = req.cookies['CODIGO_PECA']
        let funcionario = req.cookies['FUNCIONARIO']
        let revisao = req.cookies['REVISAO']
        let qtdLibMax = req.cookies['qtdLibMax']
        let setup: string = req.body['setup']
        const updateQtyQuery: string[] = [];
        let especif = req.cookies['especif']
        let numCar = req.cookies['numCar']
        let lie = req.cookies['lie']
        let lse = req.cookies['lse']
        let instrumento = req.cookies['instrumento']
        let descricao = req.cookies['descricao']

        // function sanitize(input?: string) {
        //     const allowedChars = /[A-Za-z0-9]/;
        //     return input && input
        //         .split("")
        //         .map((char) => (allowedChars.test(char) ? char : ""))
        //         .join("");
        // }
        //setup = sanitize(setup)

        //Insere os dados no banco
        if (Object.keys(setup).length <= 0) {
            return res.json({ message: "rip vazia" })
        }

        //Encerra o processo todo
        let end = new Date().getTime();
        let start: number = req.cookies["starterBarcode"]
        let tempoDecorrido = Number(new Date(start).getTime())
        let final: number = Number(end - tempoDecorrido)
        //console.log('final ', final);

        // Encerra ao final da Rip
        let endProdRip = new Date().getDate();
        let startRip: number = req.cookies["startRip"]
        let tempoDecorridoRip = Number(new Date(startRip).getDate())
        let finalProdRip: number = Number(tempoDecorridoRip - endProdRip)
        //console.log('finalProdRip ', finalProdRip);

        //Insere O CODAPONTA 6 e Tempo da rip
        await connection.query(`
            INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
        VALUES(GETDATE(), '${funcionario}', '${NUMERO_ODF}', '${codigoPeca}', '${revisao}', ${NUMERO_OPERACAO}, ${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}', '${qtdLibMax}', '0', '0', '${funcionario}', '0', '6', '6', 'Fin Prod.', '${finalProdRip}', '${finalProdRip}', '1', '0', '0')`)

        //Atualiza o tempo total que a operação levou
        try {
            await connection.query(`
                    UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`)
        } catch (error) {
            console.log(error)
            return res.json({ message: 'ocorreu um erro ao enviar os dados da rip' })
        }

        const resultSplitLines: { [k: string]: any; } = Object.keys(setup).reduce((acc: any, interator: any) => {
            const [col, lin] = interator.split("-")
            const value = setup[interator];
            if (acc[lin] === undefined) acc[lin] = {}
            acc[lin][col] = Number(value)
            return acc
        }, <{ [k: string]: any; }>{})

        Object.entries(resultSplitLines).forEach(([row], i) => {
            if (lie[i] === null) {
                lie[i] = 0
            }

            if (lse[i] === null) {
                lse[i] = 0
            }

            updateQtyQuery.push(`
            INSERT INTO 
            CST_RIP_ODF_PRODUCAO 
            (ODF, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
            VALUES('${NUMERO_ODF}','1', '${revisao}' , '${numCar[i]}', '${descricao[i]}',  '${especif[i]}','${lie[i]}', '${lse[i]}',${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `'${resultSplitLines[row].M2}'` : null},${resultSplitLines[row].M3 ? `'${resultSplitLines[row].M3}'` : null},${resultSplitLines[row].M4 ? `'${resultSplitLines[row].M4}'` : null},${resultSplitLines[row].M5 ? `'${resultSplitLines[row].M5}'` : null},${resultSplitLines[row].M6 ? `'${resultSplitLines[row].M6}'` : null},${resultSplitLines[row].M7 ? `'${resultSplitLines[row].M7}'` : null},${resultSplitLines[row].M8 ? `'${resultSplitLines[row].M8}'` : null},${resultSplitLines[row].M9 ? `'${resultSplitLines[row].M9}'` : null},${resultSplitLines[row].M10 ? `'${resultSplitLines[row].M10}'` : null},${resultSplitLines[row].M11 ? `'${resultSplitLines[row].M11}'` : null},${resultSplitLines[row].M12 ? `'${resultSplitLines[row].M12}'` : null},${resultSplitLines[row].M13 ? `'${resultSplitLines[row].M13}'` : null},'${instrumento[i]}','${CODIGO_MAQUINA}','${NUMERO_OPERACAO}')`)
        })
        await connection.query(updateQtyQuery.join("\n"))
        try {
            return res.json({ message: "rip enviada, odf finalizada" })
        } catch (error) {
            console.log(error)
            return res.json({ message: "ocorreu um erro ao enviar os dados da rip" })
        } finally {
            // await connection.close()
        }
    })

apiRouter.route("/returnedValue")
    .post(async (req, res) => {
        console.log(req.body)
        const connection = await mssql.connect(sqlConfig);
        let choosenOption = req.body['quantity']
        let supervisor = req.body['supervisor']
        let someC = req.body['returnValueStorage']
        let boas;
        let ruins;

        //console.log("choosenOption:  ", choosenOption);
        //console.log("supervisor:  ", supervisor);

        req.body["codigoBarrasReturn"] = sanitize(req.body["codigoBarrasReturn"]);
        let barcode = req.body["codigoBarrasReturn"]
        //console.log("barcode: ", barcode);

        //Sanitização
        function sanitize(input?: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input && input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }

        barcode = sanitize(barcode)
        //Verifica se o codigo de barras veio vazio
        if (barcode === undefined) {
            return res.redirect("/#/codigobarras?error=invalidBarcode")
        }

        if (barcode == '') {
            return res.redirect("/#/codigobarras?error=invalidBarcode")
        }

        if (supervisor === '') {
            return res.json({ message: "supervisor esta vazio" })
        }

        if (someC === 'BOAS') {
            boas = choosenOption
        }

        if (someC === 'RUINS') {
            ruins = choosenOption
        }

        if (boas === undefined) {
            boas = 0
        }

        if (ruins === undefined) {
            ruins = 0
        }

        console.log('boas ', boas);
        console.log('ruins ', ruins);
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
        let funcionario: string = String(req.cookies['FUNCIONARIO'])
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
            let codigoPeca: string = String(res1[0].CODIGO_PECA)
            let revisao: number = Number(res1[0].REVISAO)
            let qtdLibMax = String(res1[0].QTDE_ODF[0])
            let faltante: number = Number(0)
            let retrabalhada: number = Number(0)
            const selectSuper = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`).then(result => result.recordset);
            if (selectSuper.length > 0) {
                try {
                    const w = await connection.query(`
                    INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA) 
                    VALUES (GETDATE(), '${funcionario}', '${dados.numOdf}', '${codigoPeca}', ${revisao}, ${dados.numOper}, ${dados.numOper}, 'D', '${dados.codMaq}', ${qtdLibMax} , '0', '0', '${funcionario}', '0', '7', '7', 'Valor Estorn.', '0', '0', '1', ${faltante},${retrabalhada})`)
                        .then(record => record.recordset)

                    const s = await connection.query(`
                    UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - '${boas}', QTD_REFUGO = QTD_REFUGO - ${ruins} WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' AND CODIGO_MAQUINA = '${dados.codMaq}'`)
                        .then(record => record.recordset)

                    console.log("linha 1024");
                    if (!w) {
                        return res.json({ message: 'erro ao fazer estorno feito' })
                    } else {
                        return res.status(200).json({ message: 'estorno feito' })
                    }
                } catch (error) {
                    console.log(error)
                } finally {
                    await connection.close()
                }
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

        if (supervisor === '' || supervisor === undefined || supervisor === null) {
            return res.json({ message: 'supervisor não encontrado' })
        }
        try {
            const resource = await connection.query(`
            SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`).then(result => result.recordset);
            if (resource.length > 0) {
                return res.status(200).json({ message: 'supervisor encontrado' })
            } else {
                return res.json({ message: 'supervisor não encontrado' })
            }
        } catch (error) {
            return res.json({ message: 'supervisor não encontrado' })
        } finally {
            //await connection.close()
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
                return res.status(400).json({ message: "erro na parada de maquina" })
            }
        } catch (error) {
            return res.status(400).json({ message: "erro na parada de maquina" })
        } finally {
            //await connection.close()
        }
    })

apiRouter.route("/motivoParada")
    .get(async (_req, res) => {
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
                SELECT CODIGO,DESCRICAO FROM APT_PARADA (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
            let resoc = resource.map(e => e.DESCRICAO)
            if (!resource) {
                return res.json({ message: 'erro motivos de parada de maquina' })
            } else {
                return res.status(200).json(resoc)
            }
        } catch (error) {
            return res.json({ message: 'erro motivos de parada de maquina' })
        } finally {
            //await connection.close()
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
        let end = new Date().getTime();
        let start = req.cookies["starterBarcode"]
        let newStart = Number(new Date(start).getTime())
        let final: number = end - newStart
        try {
            //Insere O CODAPONTA 5
            const resour = await connection.query(`
                INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
                VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${numeroOperacao} ,${numeroOperacao}, 'D', '${codigoMaq}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '5' , '5', 'Parada.' , '${final}' , '${final}' , '1' ,'0','0')`).then(record => record.recordset)
            if (resour.length <= 0) {
                return res.status(400).json({ message: 'erro ao parar a maquina' })
            } else {
                return res.status(200).json({ message: 'maquina parada com sucesso' })
            }
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "ocorre um erro ao tentar parar a maquina" })
        } finally {
            // await connection.close()
        }
    })

apiRouter.route("/motivorefugo")
    .get(async (_req, res) => {
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
            SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
            let resoc = resource.map(e => e.DESCRICAO)
            //console.log('resourc: linha 1145 ', resource);
            if (resource.length > 0) {
                return res.status(200).json(resoc)
            } else {
                return res.status(400).json({ message: 'erro em motivos do refugo' })
            }
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: 'erro em motivos de refugo' })
        } finally {
            //await connection.close()
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
            //await connection.close()
        }
    });

export default apiRouter;