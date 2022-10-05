import { Router } from "express";
import { date } from "joi";
//import assert from "node:assert";
import mssql from "mssql";
import { sqlConfig } from "../global.config";
import { pictures } from "./pictures";

const apiRouter = Router();
// /api/v1/
apiRouter.route("/apontamento")
    .post(async (req, res) => {
        //Sanitização do codigo
        req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
        let barcode = req.body["codigoBarras"]

        function sanitize(input: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }

        if (barcode == '') {
            res.status(400).redirect("/#/codigobarras?error=invalidBarcode")
        }

        //Divide o Codigo de barras em 3 partes para a verificação na proxima etapa
        const dados = {
            numOdf: Number(barcode.slice(10)),
            numOper: String(barcode.slice(0, 5)),
            codMaq: String(barcode.slice(5, 10)),
        }

        //Verifica se a odf ja foi iniciada
        const connection = await mssql.connect(sqlConfig);
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
                        `.trim()
        ).then(result => result.recordset)

        res.cookie("NUMERO_ODF", dados.numOdf)
        res.cookie("CODIGO_PECA", resource[0].CODIGO_PECA)
        res.cookie("CODIGO_MAQUINA", resource[0].CODIGO_MAQUINA)
        res.cookie("NUMERO_OPERACAO", resource[0].NUMERO_OPERACAO)
        // var CODIGO_PECA = res.cookie("CODIGO_PECA", resource[0].CODIGO_PECA)

        if (resource.length > 0) {
            try {
                //Seleciona as peças filhas, a quantidade para execução e o estoque dos itens
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
                        `.trim()
                ).then(result => result.recordset)
                console.log("resource2:78", resource2)
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
                console.log("execut:99", execut, "saldoReal:99", saldoReal)

                let qtdTotal = calMaxQuant(execut, saldoReal);
                console.log("qtdTotal", qtdTotal)

                //Retorna um array com a quantidade de itens total da execução
                const reservedItens = execut.map((quantItens) => {
                    return Math.floor((qtdTotal || 0) * quantItens)
                }, Infinity)
                let reserved = res.cookie("reservedItens", reservedItens)
                Number(reserved)

                //Codigo retorna com erro pois a promise aguarda os valores
                // let quan = [1, 2, 3] //É reservedItens
                // let str = ["105830489-1", "105830489-2", "105830489-3"] //É codigoFilho

                const codigoFilho = resource2.map(item => item.NUMITE)
                res.cookie("codigoFilho", codigoFilho)
                console.log("codigoFilho:115", codigoFilho)

                try {
                    // Loop para atualizar os dados no DB
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

                    console.log("updateQty:132", updateQty)
                    console.log("updateRes:142", updateRes);
                    return res.status(200).redirect("/#/codigobarras?red=red")
                } catch (err) {
                    console.log("Erro:135", err)
                    return res.status(400).redirect("/#/codigobarras?error=invalidBarcode")
                }
            } catch (error) {
                console.log("erro linha 138", error)
                return res.status(400).redirect("/#/codigobarras?error=invalidBarcode")
            } finally {
                await connection.close()
            }
        } else {
            console.log("Não encontrou ODF com esse número");
            return res.status(400).redirect("/#/codigobarras?error=invalidBarcode")
        }
    })

apiRouter.route("/apontamentoCracha")
    .post(async (req, res) => {
        let finalTimer = 6000000
        let MATRIC: String = req.body["MATRIC"].trim()

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
            const resource = await connection.query(` 
                SELECT TOP 1
                [MATRIC],
                [FUNCIONARIO]
                FROM FUNCIONARIOS
                WHERE 1 = 1
                AND [MATRIC] = ${MATRIC}
                `.trim()
            ).then(result => result.recordset)
            if (resource.length > 0) {
                let start = new Date();
                let mili = start.getMilliseconds() / 1000;
                res.cookie("starterBarcode", mili)
                res.cookie("MATRIC", resource[0].MATRIC, { httpOnly: true, maxAge: finalTimer })
                res.cookie("FUNCIONARIO", resource[0].FUNCIONARIO)
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
        let NUMERO_ODF = req.cookies["NUMERO_ODF"]
        let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"]
        let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"]
        const connection = await mssql.connect(sqlConfig);
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
                FROM PCP_PROGRAMACAO_PRODUCAO
                WHERE 1 = 1
                AND [NUMERO_ODF] = ${NUMERO_ODF}
                AND [CODIGO_MAQUINA] = '${CODIGO_MAQUINA}'
                AND [NUMERO_OPERACAO] = ${NUMERO_OPERACAO}
                ORDER BY NUMERO_OPERACAO ASC`.trim()).then(result => result.recordset);
            res.cookie("qtdProduzir", resource[0].QTDE_ODF)
            res.json(resource);
        } catch (error) {
            console.log(error);
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/imagem")
    .get(async (req, res) => {
        const NUMPEC = req.cookies["CODIGO_PECA"]
        const connection = await mssql.connect(sqlConfig);
        let statusImg = "_status"
        try {
            const resource = await connection.query(`
            SELECT TOP 1
            [NUMPEC],
            [IMAGEM]
            FROM PROCESSO (NOLOCK)
            WHERE 1 = 1
            AND NUMPEC = '${NUMPEC}'
            AND IMAGEM IS NOT NULL
            `).then(res => res.recordset);
            let imgResult = [];
            for await (let [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
                imgResult.push(path);
            }
            res.json(imgResult)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: true, message: "Erro no servidor." });
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
        try {
            const resource = await connection.query(`
            SELECT TOP 1 EXECUT FROM OPERACAO WHERE NUMPEC = '${numpec}' AND MAQUIN = '${maquina}' ORDER BY REVISAO DESC
            `).then(record => record.recordset)
            res.cookie("Tempo Execucao", resource[0].EXECUT)
            let qtdProd = req.cookies["qtdProduzir"][0]
            //valor em segundos
            let result = Number(resource[0].EXECUT * 1000)
            //valor vezes a quantidade de peças
            let tempoTotalExecução: Number = Number(result * qtdProd)
            let tempoTotal = Number(tempoTotalExecução) - tempoInicio
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
        let NUMERO_ODF: String = req.cookies["NUMERO_ODF"]
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
            SELECT
            *
            FROM VW_APP_APONTAMENTO_HISTORICO
            WHERE 1 = 1
            AND ODF = '${NUMERO_ODF}'
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
        let CODIGO = req.cookies["CODIGO_PECA"]

        //Inicia a produção
        let startProd = new Date();
        let newStartProd = startProd.getMilliseconds() / 1000;
        res.cookie("startProd", newStartProd)

        let ferramenta = "_ferr"
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
                const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
                result.push(path);
            }
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
        let final = '0.0040'
        let numero_odf = '1378773'
        const connection = await mssql.connect(sqlConfig);
        try {
            //Encerra o primeiro(selecionar as ferramentas) Timer
            let end = new Date();
            let newEnd = end.getMilliseconds() / 1000;
            let start = req.cookies["starterBarcode"]
            let final: Number = Number(newEnd) - Number(start)
            //res.cookie("tempoFinalFerr", final)
            const insertSql = await connection.query(`UPDATE HISAPONTA SET TEMPO_SETUP = TEMPO_SETUP + '${final}' WHERE 1 = 1 AND ODF = '${numero_odf}'`)
            console.log("Insert: linha 356:", insertSql)
            return res.status(200).json()
        } catch (error) {
            console.log(error)
            return res.status(400).redirect("/#/ferramenta")
        } finally {
            await connection.close()
        }
    })

// apiRouter.route("/ferramenta")
//     .get(async (req, res) => {
//         const CODIGO = '00240347'
//         const connection = await mssql.connect(sqlConfig);
//         let ferramenta = "_ferr"

//         try {
//             const resource = await connection.query(`
//             SELECT 
//             [IMAGEM], 
//             [CODIGO]
//             FROM VIEW_APTO_FERRAMENTAL 
//             WHERE 1 = 1
//             AND CODIGO = '${CODIGO}'
//             AND IMAGEM IS NOT NULL
//             `.trim());
//             res.json(resource)
//             const result = resource.recordset.map(record => {
//                 const imgPath = pictures.getPicturePath(record["CODIGO"], record["IMAGEM"], (ferramenta));
//                 return {
//                     img: imgPath,
//                     codigoInterno: record[`NUMPEC`],
//                     sufixo: record["sufixo"],
//                 }
//             });
//             let s = Object.values(result)
//             if (s.length > 0) {
//                 // res.status(200).redirect("/#/ferramenta?statusferr=ok")
//             } else {
//                 res.status(500).redirect("/#/apontamento")
//             }
//         } catch (error) {
//             res.status(400).redirect("/#/codigobarras?error=invalidBarcode")
//         } finally {
//             // Encerra o primeiro(selecionar as ferramentas) Timer
//             let end = new Date();
//             let start = req.cookies["starterBarcode"]
//             let final = end.getTime() - Number(start)
//             const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')')
//             await connection.close()
//         }
//     })

apiRouter.route("/apontar")
    .post(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        var codigoFilho = req.cookies['codigoFilho']
        var reservedItens = req.cookies['reservedItens']
        let NUMERO_ODF = req.cookies["NUMERO_ODF"].trim()
        let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"].trim()
        let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"].trim()
        let EMPRESA_RECNO = 1
        let NUMPEC = req.cookies["CODIGO_PECA"].trim()
        let QTDE_APONTADA = req.body.goodFeed.trim()
        let qtdRefugo = req.body.badFeed.trim()
        let CST_PC_FALTANTE = req.body.missingFeed.trim()
        let CST_QTD_RETRABALHADA = req.body.reworkFeed.trim()
        let parcialFeed = req.body.parcial.trim()

        //Sanitização de input
        function sanitize(input: String) {
            const allowedChars = /[A-Za-z0-9]/;
            return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }

        QTDE_APONTADA = sanitize(req.body.goodFeed)
        qtdRefugo = sanitize(req.body.badFeed)
        CST_PC_FALTANTE = sanitize(req.body.missingFeed)
        CST_QTD_RETRABALHADA = sanitize(req.body.reworkFeed)
        parcialFeed = sanitize(req.body.parcial)

        //Inicia tempo de Rip
        let startRip = new Date();
        let mili = startRip.getMilliseconds();
        //console.log("mili: linha 428", mili / 1000)
        res.cookie("startRip", startRip.getTime())


        // let endProdTimer = new Date();
        // let startProd = req.cookies["startProd"]
        // let finalProdTimer = endProdTimer.getTime() - Number(startProd)
        // console.log("Primeira operação: " + finalProdTimer / 1000 + " segundos")


        // try {
        //     const resource = await connection.query(`
        //         SELECT TOP 1
        //         [ODF],
        //         [PECA],
        //         [REVISAO],
        //         [ITEM],
        //         [PC_BOAS],
        //         [PC_REFUGA], 
        //         [REVISAO]
        //         FROM            
        //         HISAPONTA
        //         WHERE 1 = 1
        //         AND [ODF] = ${NUMERO_ODF}
        //         AND [PECA] =${NUMPEC}
        //         ORDER BY DATAHORA DESC
        //         `.trim()
        //     ).then(result => result.recordset)
        // } catch (error) {
        //     console.log(error)
        // } finally {
        //     await connection.close()
        // }


        // Por enquanto esta sendo mantido mas vai entrar uma verificação booleana, e provalvelmente depois LIXO
        // try {
        //     const resource = await connection.query(`
        //         UPDATE CST_ALOCACAO  SET QUANTIDADE =  QUANTIDADE + '${QTDE_APONTADA}' WHERE 1 = 1 AND ODF = '${NUMERO_ODF}'`);
        //     const result = resource.recordset.map(() => { });
        //     res.json(result);
        // } catch (error) {
        //     console.log(error)
        //     res.status(500).json({ error: true, message: "Erro no servidor." });
        // } finally {
        //     await connection.close()
        // }
        try {
            // Loop para atualizar os dados no DB
            const updateQtyQuery = [];
            const updateQtyRes = [];

            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
            }
            const updateQty = await connection.query(updateQtyQuery.join("\n"));
            console.log("updateQty: linha 510", updateQty)


            for (const [i, qtdItem] of reservedItens.entries()) {
                updateQtyRes.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
            }
            const updateRes = await connection.query(updateQtyRes.join("\n"));
            console.log("updateRes: linha 517", updateRes)

            return res.status(200).redirect(`/#/rip`)
        } catch (err) {
            console.log("Erro:135", err)
            return res.status(400).redirect("/#/codigobarras/apontamento")
        }


        // try {
        //     let endProdTimer = new Date();
        //     let startProd = req.cookies["startProd"]
        //     let finalProdTimer = endProdTimer.getTime() - Number(startProd)
        //     console.log("Primeira operação: " + finalProdTimer / 1000 + " segundos")


        //     // if (CST_PC_FALTANTE > 0 || CST_QTD_RETRABALHADA > 0) {
        //     const insertSqlRework = await connection.query('INSERT INTO HISAPONTA(CST_PC_FALTANTE, CST_QTD_RETRABALHADA) VALUES (' + CST_PC_FALTANTE + ',' + CST_QTD_RETRABALHADA + ')')
        //     console.log(insertSqlRework)
        //     // } else {

        //     const insertSql = await connection.query('INSERT INTO PCP_PROGRAMACAO_PRODUCAO(NUMERO_ODF,NUMERO_OPERACAO,CODIGO_MAQUINA,EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO) VALUES (' + NUMERO_ODF + ',' + NUMERO_OPERACAO + ',' + CODIGO_MAQUINA + ',' + EMPRESA_RECNO + ',' + QTDE_APONTADA + ',' + QTD_REFUGO + ')')
        //     console.log(insertSql)
        //     // }

        //     const insertSqlTimer = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdTimer + ')')
        //     console.log(insertSqlTimer)
        //     res.status(200).redirect(`/#/rip`)
        // } catch (error) {
        //     res.redirect(`/#/codigobarras/apontamento?erro=apontamentoInvalido`)
        // } finally {
        //     await connection.close()
        // }

    }
    )

apiRouter.route("/rip")
    .get(async (req, res) => {
        const connection = await mssql.connect(sqlConfig);
        let NUMPEC: Number = req.cookies["CODIGO_PECA"]
        let REVISAO = '02'

        //Inicia tempo de Rip
        let startRip = new Date();
        let ripMiliseg: Number = Number(startRip.getMilliseconds() / 1000);
        res.cookie("startRip", ripMiliseg)
        console.log(ripMiliseg);

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
			WHERE PROCESSO.NUMPEC = '${NUMPEC}' 
            AND PROCESSO.REVISAO = '${REVISAO}' 
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
        let SETUP = req.body.SETUP.trim()
        console.log("debug: linha 603");
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

        function sanitize(input: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input
                .split("")
                .map((char) => (allowedChars.test(char) ? char : ""))
                .join("");
        }
        SETUP = sanitize(req.body.SETUP)
        console.log("SETUP: LINHA 619", SETUP);

        //Encerra o processo todo
        let end = new Date();
        let newNemEnd: Number = Number(end.getMilliseconds() / 1000);
        let start = req.cookies["starterBarcode"]
        let final: Number = Number(newNemEnd) - Number(start);
        console.log("Final: linha 625", final);

        // Encerra ao final da Rip
        let endProdRip = new Date();
        let newendProdRip: Number = Number(endProdRip.getMilliseconds() / 1000);
        let startRip = req.cookies["startRip"]
        let finalProdRip: Number = Number(newendProdRip) - Number(startRip)
        console.log("finalProdRip: linha 638", finalProdRip)

        //Insert com o tempo final no banco
        const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdRip + ')')
        console.log("Rip: " + finalProdRip + " segundos")

        const insertSql2 = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')')
        console.log("Completo: " + final + " segundos")

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
        // let returnedvalue = req.body.returnedvalue.trim()
        //let returnedvalue = '1'
        let NUMERO_ODF = req.cookies["NUMERO_ODF"].trim()
        // let superCracha = req.body.superCracha.trim();
        // returnedvalue = sanitize(req.body.returnedvalue)
        // superCracha = sanitize(req.body.superCracha)
        console.log("debug: linha 672")

        function sanitize(input: String) {
            const allowedChars = /[A-Za-z0-9]/;
            return input
                .split("")
                .map((char) => (allowedChars.test(char) ? char : ""))
                .join("");
        }

        console.log("debug: linha 684")
        // returnedvalue = sanitize(req.body.returnedValue)
        try {
            const resource = await connection.query(`
            UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + 1 WHERE 1= 1 AND ODF= '1232975' AND CODIGO_FILHO = '105830489-1'`);
            console.log("resource: linha 690?", resource)
            return res.status(200).redirect("/#/codigobarras")
        } catch (error) {
            console.log(error)
            return res.status(200).redirect("/#/rip?error=riperror")
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/parada")
    .get(async (req, res) => {
        let numeroOdf = req.cookies["NUMERO_ODF"]
        let returnedvalue = req.cookies["returnedValue"]

        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
                    UPDATE CST_ALOCACAO  SET SALDOREAL =  SALDOREAL - '${returnedvalue}' WHERE 1 = 1 AND ODF = '${numeroOdf}'`);
            console.log(resource)
            res.status(200).json(resource)
        } catch (error) {
            console.log(error)
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
            res.status(200).json(resoc)
        } catch (error) {
            console.log(error)
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/motivorefugo")
    .get(async (_req, res) => {
        const connection = await mssql.connect(sqlConfig);
        console.log("object");
        try {
            const resource = await connection.query(`
            SELECT R_E_C_N_O_,DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`).then(record => record.recordset);
            let resoc = resource.map(e => e.DESCRICAO)
            console.log(resoc)
            return res.status(200).json(resoc)
        } catch (error) {
            return console.log(error)
        } finally {
            await connection.close()
        }
    })


apiRouter.route("/pausa")
    .get(async (req, res) => {
        let numeroOdf = req.cookies["NUMERO_ODF"]
        let returnedvalue = req.cookies["returnedValue"]

        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
                    UPDATE CST_ALOCACAO  SET SALDOREAL =  SALDOREAL - '${returnedvalue}' WHERE 1 = 1 AND ODF = '${numeroOdf}'`);
            console.log(resource)
            return res.status(200).json(resource)
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
        const revisao = 3;
        const numpec = req.cookies["CODIGO_PECA"]
        let desenho = "_desenho"
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
                AND REVISAO = ${revisao}
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