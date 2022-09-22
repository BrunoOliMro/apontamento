import { response, Router } from "express";
import assert from "node:assert";
import mssql, { map } from "mssql";
import { sqlConfig } from "../global.config";
import { pictures } from "./pictures";

const apiRouter = Router();
// /api/v1/
apiRouter.route("/apontamento")
    .post(async (req, res) => {
        var NUMERO_ODF = '1232975'
        //Sanitização do codigo
        req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
        let barcode = req.body["codigoBarras"]

        function sanitize(input: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
        }



        if (barcode === '') {
            res.status(400).redirect("/#/codigobarras")
        } else {
            //Divide o codigo em 3 partes para a verificação na proxima etapa
            const dados = {
                numOdf: Number(barcode.slice(10)),
                numOper: String(barcode.slice(0, 5)),
                codMaq: String(barcode.slice(5, 10)),
            }
            //Inicia a conexão com o banco de dados e verifica se existe esse codigo
            const connection = await mssql.connect(sqlConfig);
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
                        `.trim()
                ).then(result => result.recordset)
                if (resource.length > 0) {
                    res.cookie("NUMERO_ODF", resource[0].NUMERO_ODF)
                    res.cookie("NUMERO_ODF", resource[0].NUMERO_ODF)
                    res.cookie("CODIGO_MAQUINA", resource[0].CODIGO_MAQUINA)
                    res.cookie("NUMERO_OPERACAO", resource[0].NUMERO_OPERACAO)
                    res.cookie("CODIGO_PECA", resource[0].CODIGO_PECA)
                    res.cookie("barcode", barcode)
                    res.status(200).redirect("/#/ferramenta")
                } else {
                    res.status(400).send("ODF nao ienwurwbv!")
                }
            } catch (error) {
                console.log(error)
                res.status(400).send("Dados não encontrados!")
            } finally {
                await connection.close();
            }



            try {
                const resource = await connection.query(`
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
                       AND PCP.NUMERO_ODF = '${NUMERO_ODF}'    
                    `.trim()
                ).then(result => result.recordset)
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
                // // Teste 1
                // assert.deepStrictEqual(
                //     calMaxQuant(
                //         [1, 1, 1],
                //         [1, 1, 119]
                //     ),
                //     1,
                //     "Teste 1"
                // );
                // // Teste 2
                // assert.deepStrictEqual(
                //     calMaxQuant(
                //         [100, 1],
                //         [99, 4]
                //     ),
                //     0,
                //     "Teste 2"
                // );

                const execut = resource.map(item => item.EXECUT);
                const saldoReal = resource.map(item => item.SALDOREAL);

                let qtdTotal = calMaxQuant(execut, saldoReal);

                //Reservar a quantidade de itens para o processo
                const reservedItens = execut.map((e) => {
                    return Math.floor((qtdTotal || 0) * e)
                }, Infinity)


                //Faz update na coluna Reserva
                try {
                    const resource = await connection.query(`
                    UPDATE CST_ALOCAÇÃO SET  QUANTIDADE AS RESERVA = RESERVA + '${reservedItens}' WHERE 1= 1 AND ODF= '${NUMERO_ODF}'`);
                    const result = resource.recordset.map(() => { });
                } catch (error) {
                    console.log(error)
                    res.sendStatus(500).json({ error: true, message: "Erro no servidor." });
                } finally {
                    await connection.close()
                }

                //Faz update no estoque
                try {
                    const resource = await connection.query(`
                    UPDATE CST_ALOCAÇÃO SET  SALDOREAL = SALDOREAL + '${reservedItens}' WHERE 1= 1 AND ODF= '${NUMERO_ODF}'`);
                    const result = resource.recordset.map(() => { });
                } catch (error) {
                    console.log(error)
                    res.sendStatus(500).json({ error: true, message: "Erro no servidor." });
                } finally {
                    await connection.close()
                }


                res.json()
            } catch (error) {
                console.log(error)
            } finally {
                await connection.close()
            }

        }
    }
    )

apiRouter.route("/apontamentoCracha")
    .post(async (req, res) => {
        let finalTimer = 6000000
        let maxRange = finalTimer
        //Sanitizar codigo
        let MATRIC: String = req.body["MATRIC"].trim()

        if (MATRIC === '') {
            res.status(404).send("FUNCIONARIO DESTA MATRICULA NAO ENCONTRADO" + MATRIC)
        } else {
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
                    let mili = start.getMilliseconds();
                    console.log(mili / 1000)
                    res.cookie("starterBarcode", start.getTime())
                    res.cookie("MATRIC", resource[0].MATRIC, { httpOnly: true, maxAge: maxRange })
                    res.cookie("FUNCIONARIO", resource[0].FUNCIONARIO)
                    res.status(200).redirect("/#/codigobarras")
                } else {
                    res.status(404).redirect("/#/codigobarras")
                }
            } catch (error) {
                res.status(404).send("Erro")
            } finally {
                await connection.close()
            }
        }
    });

apiRouter.route("/odf")
    .get(async (req, res) => {
        let NUMERO_ODF = (req.query["NUMERO_ODF"] as string).trim() || undefined;
        let CODIGO_MAQUINA = (req.query["CODIGO_MAQUINA"] as string).trim() || undefined;
        let NUMERO_OPERACAO = (req.query["NUMERO_OPERACAO"] as string).trim() || undefined;
        //(
        //     SELECT TOP 1 ISNULL(NOME_CRACHA,'INVALIDO') AS NOME_CRACHA, US.NOME FROM FUNCIONARIOS (NOLOCK)
        //     INNER JOIN USUARIOS_SISTEMA US (NOLOCK) ON US.R_E_C_N_O_ = FUNCIONARIOS.USUARIO_SISTEMA
        //     WHERE FUNCIONARIOS.CRACHA = AS OPERADOR'   
        // ) AS OPERADOR
        const connection = await mssql.connect(sqlConfig);
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
        } catch (error) {
            console.log(error);
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/IMAGEM")
    .get(async (req, res) => {
        const NUMPEC = await req.cookies["CODIGO_PECA"]
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
            `);
            const result = resource.recordset.map(record => {
                const imgPath = pictures.getPicturePath(record[`NUMPEC`], record["IMAGEM"], (statusImg));
                return {
                    img: imgPath, // caminho da imagem (ex.: "")
                    sufixo: record["sufixo"]
                }
            });
            res.json(result)
        } catch (error) {
            console.log(error)
            res.sendStatus(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

apiRouter.route("/HISTORICO")
    .get(async (req, res, next) => {
        let NUMERO_ODF = req.cookies["NUMERO_ODF"]
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
            SELECT
            *
            FROM VW_APP_APONTAMENTO_HISTORICO
            WHERE 1 = 1
            AND [ODF] = ${NUMERO_ODF}
            `);
            res.json(resource)
            return next()
        } catch (error) {
            console.log(error)
            res.sendStatus(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

apiRouter.route("/ferramenta")
    .get(async (req, res, next) => {
        const tools = 0

        // Encerra o primeiro(selecionar as ferramentas) Timer
        let end = new Date();
        let start = req.cookies["starterBarcode"]
        let final = end.getTime() - Number(start)
        console.log("Primeira operação: " + final / 1000 + " segundos")


        //Inicia a produção
        let startProd = new Date();
        let mili = startProd.getMilliseconds();
        res.cookie("startProd", startProd.getTime())

        const connection = await mssql.connect(sqlConfig);
        try {
            //Verifica se houve um resultado em resource e caso haja redireciona
            if (tools === 0) {
                //Insere o resultado do tempo no banco
                const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')')
                res.redirect(`/#/ferramenta`)
                return next()
            } else {
                res.redirect(`/#/ferramenta`)
                return next()
            }
        } catch (error) {
            console.log(error);
        } finally {
            await connection.close()
            return next();
        }
    })
    //GET das Fotos das ferramentas
    .get(async (req, res) => {
        const CODIGO = await req.cookies["CODIGO_PECA"]
        const connection = await mssql.connect(sqlConfig);
        let ferramenta = "_ferr"
        console.log(CODIGO)
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
                const imgPath = pictures.getPicturePath(record["CODIGO"], record["IMAGEM"], (ferramenta));
                return {
                    img: imgPath, // caminho da imagem (ex.: "")
                }
            });
            if (result.length > 0) {
                res.json()
            } else {
                res.redirect("/#/apontamento")
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

apiRouter.route("/apontar")
    .post(async (req, res) => {
        // var NUMERO_ODFUp = '1232975'
        //  req.body = sanitize(req.body.trim());
        let status = '';
        let NUMERO_ODF = req.cookies["NUMERO_ODF"].trim()
        let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"].trim()
        let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"].trim()
        let EMPRESA_RECNO = 1
        let QTDE_APONTADA = req.body["goodFeed"].trim()
        let QTD_REFUGO = req.body["badfeed"].trim()
        let CST_PC_FALTANTE = req.body["reworkFeed"].trim()
        let CST_QTD_RETRABALHADA = req.body["missingFeed"].trim()

        //Sanitizaão de input
        function sanitize(input: string) {
            const allowedChars = /[A-Za-z0-9]/;
            return input
                .split("")
                .map((char) => (allowedChars.test(char) ? char : ""))
                .join("");
        }

        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
                SELECT TOP 1
                [ODF],
                [PECA],
                [REVISAO],
                [ITEM],
                [PC_BOAS],
                [PC_REFUGA]
                FROM            
                HISAPONTA
                WHERE 1 = 1
                AND [ODF] = ${NUMERO_ODF}
                AND [PECA] =${CODIGO_MAQUINA}
                ORDER BY DATAHORA DESC
                `.trim()
            ).then(result => result.recordset)
        } catch (error) {
            console.log(error)
        } finally {
            await connection.close()
        }


        // Por enquanto esta sendo mantido mas vai entrar uma verificação booleana, e provalvelmente depois LIXO
        try {
            const resource = await connection.query(`
                UPDATE CST_ALOCACAO  SET QUANTIDADE =  QUANTIDADE + '${QTDE_APONTADA}' WHERE 1 = 1 AND ODF = '${NUMERO_ODF}'`);
            const result = resource.recordset.map(() => { });
            res.json(result);
        } catch (error) {
            console.log(error)
            res.sendStatus(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }


        try {
            let endProdTimer = new Date();
            let startProd = req.cookies["startProd"]
            let finalProdTimer = endProdTimer.getTime() - Number(startProd)
            console.log("Primeira operação: " + finalProdTimer / 1000 + " segundos")


            //Inicia tempo de Rip
            let startRip = new Date();
            let mili = startRip.getMilliseconds();
            console.log(mili / 1000)
            res.cookie("startRip", startRip.getTime())

            // if (CST_PC_FALTANTE > 0 || CST_QTD_RETRABALHADA > 0) {
            const insertSqlRework = await connection.query('INSERT INTO HISAPONTA(CST_PC_FALTANTE, CST_QTD_RETRABALHADA) VALUES (' + CST_PC_FALTANTE + ',' + CST_QTD_RETRABALHADA + ')')
            // } else {

            const insertSql = await connection.query('INSERT INTO PCP_PROGRAMACAO_PRODUCAO(NUMERO_ODF,NUMERO_OPERACAO,CODIGO_MAQUINA,EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO) VALUES (' + NUMERO_ODF + ',' + NUMERO_OPERACAO + ',' + CODIGO_MAQUINA + ',' + EMPRESA_RECNO + ',' + totalPecas + ',' + totalRefugo + ')')
            // }

            const insertSqlTimer = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdTimer + ')')

            const resourceReserved = await connection.query(`UPDATE CST_ALOCAÇÃO SET  QUANTIDADE AS RESERVA = RESERVA - '${QTDE_APONTADA}' WHERE 1= 1 AND ODF= '${NUMERO_ODF}'`);

            const resourceSaldoReal = await connection.query(`UPDATE CST_ALOCAÇÃO SET  SALDOREAL = SALDOREAL - '${QTDE_APONTADA}' WHERE 1= 1 AND ODF= '${NUMERO_ODF}'`);


            res.sendStatus(200).redirect(`/#/rip`)
        } catch (error) {
            res.redirect(`/#/rip`)
        } finally {
            await connection.close()
        }

    }
    )

apiRouter.route("/rip")
    .get(async (req, res) => {
        var NUMERO_ODF = '1232975'
        let NUMPEC = '00240070'
        let REVISAO = '02'
        let NUMCAR = '2999'
        const connection = await mssql.connect(sqlConfig);
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
            AND NUMCAR < '${NUMCAR}'
            ORDER BY NUMPEC ASC
                `.trim()
            ).then(result => result.recordset)

            try {
                const resource = await connection.query(`
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
                   AND PCP.NUMERO_ODF = '${NUMERO_ODF}'    
                `.trim()
                ).then(result => result.recordset)

            } catch (error) {
                console.log(error)
            } finally {
                await connection.close()
            }
            //Encerra o processo todo
            let end = new Date();
            let start = req.cookies["starterBarcode"]
            let final = end.getTime() - Number(start)

            // Encerra ao final da Rip
            let endProdRip = new Date();
            let startRip = req.cookies["startRip"]
            let finalProdRip = endProdRip.getTime() - Number(startRip)

            // Insert com o tempo final no banco
            // const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdRip + ')')
            // console.log("Rip: " + finalProdRip / 1000 + " segundos")

            // const insertSql2 = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')')
            // console.log("Completo: " + final / 1000 + " segundos")
            res.json(resource)
        } catch (error) {
            console.log(error)
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/lancamentoRip")
    .post(async (req, res) => {
        let returnedvalue = req.body["returnValue"].trim()
        let NUMERO_ODF = req.cookies["NUMERO_ODF"]
        let SETUP = req.body["SETUP"].trim()
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
        const connection = await mssql.connect(sqlConfig);
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
        let returnedvalue = req.body["returnValue"].trim()
        let NUMERO_ODF = req.body["returnValue"].trim()
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
                    UPDATE CST_ALOCACAO  SET SALDOREAL =  SALDOREAL - '${returnedvalue}' WHERE 1 = 1 AND ODF = '${NUMERO_ODF}'`);
            const result = resource.recordset.map(() => { });
            console.log(resource)
            res.status(200).json(resource)
        } catch (error) {
            console.log(error)
        } finally {
            await connection.close()
        }
    })

apiRouter.route("/desenho")
    //GET das Fotos das desenho
    .get(async (req, res) => {
        const NUMPEC = await req.cookies["CODIGO_PECA"]
        const connection = await mssql.connect(sqlConfig);
        let desenho = "_desenho"
        try {
            const resource = await connection.query(`
            SELECT
            [NUMPEC],
            [IMAGEM]
            FROM  QA_LAYOUT(NOLOCK) 
            WHERE 1 = 1 
            AND NUMPEC = '${NUMPEC}'
            AND IMAGEM IS NOT NULL`);
            const result = resource.recordset.map(record => {
                const imgPath = pictures.getPicturePath(record[`NUMPEC`], record["IMAGEM"], desenho);
                return {
                    img: imgPath,
                    codigoInterno: record[`NUMPEC`],
                    sufixo: record["sufixo"],
                }
            });
            res.json(result);
        } catch (error) {
            console.log(error)
            res.sendStatus(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });

export default apiRouter;