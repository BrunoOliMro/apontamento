import { Router } from "express";
import mssql from "mssql";
import { sqlConfig } from "../global.config";
import { pictures } from "./pictures";

const apiRouter = Router();

// /api/v1/

apiRouter.route("/apontamentoCracha")
    .post(async (req, res) => {
        //Sanitizar codigo
        let MATRIC: any = (req.body["MATRIC"] as string).trim() || 0
        res.cookie("MATRIC", MATRIC)

        if (MATRIC === "") {
            res.redirect(`/#/codigobarras`)
        } else {

            const connection = await mssql.connect(sqlConfig);
            try {
                const resource = await connection.query(` 
                SELECT TOP 1
                [MATRIC]
                FROM FUNCIONARIOS
                WHERE 1 = 1
                AND [MATRIC] = ${MATRIC}
                `.trim()
                ).then(result => result.recordset)
                if (resource.length > 0) {
                    res.redirect("/#/codigobarras")
                } else {
                    res.redirect("/#/codigobarras")
                }
            } catch (error) {
                console.log(error)
            } finally {
                await connection.close()
            }
        }
    });

apiRouter.route("/apontamento")
    .post(
        //Sanitização do codigo
        async (req, _res, next) => {
            req.body["codigoBarras"] = sanitize(req.body["codigoBarras"].trim());
            return next();

            function sanitize(input: string) {
                const allowedChars = /[A-Za-z0-9]/;
                return input
                    .split("")
                    .map((char) => (allowedChars.test(char) ? char : ""))
                    .join("");
            }
        },
        async (req, res, next) => {
            const barcode = req.body["codigoBarras"];
            res.cookie("barcode", barcode)
            const tool = 0

            if (barcode === "") {
                res.redirect('/#/codigobarras')
            } else {
                //Divide o codigo em 3 partes para a verificação na proxima etapa
                const dados = {
                    numOdf: Number(barcode.slice(10)),
                    numOper: barcode.slice(0, 5),
                    codMaq: barcode.slice(5, 10),
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
                    ).then(result => result.recordset);
                    res.cookie("CODIGO_PECA", resource[0].CODIGO_PECA)
                    res.cookie("NUMERO_ODF", resource[0].NUMERO_ODF)
                    res.redirect("/#/ferramenta")
                    //Verifica se houve um resultado em resource e caso haja redireciona
                    if (tool > 0) {
                        // Vai ate o final da ferramenta
                        // Vai até o final do processo
                        var secondSetup = performance.now()
                        res.cookie("secondSetup", secondSetup)
                        console.log("Iniciou processo: " + secondSetup)
                        res.redirect("/#/ferramenta")
                    } else {
                        res.redirect("/#/codigobarras")
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    await connection.close();
                    next()
                }
            }
        }
    )
    .get(async (req, res, next) => {
        const NUMERO_ODF: any = (req.query["NUMERO_ODF"] as string).trim() || undefined;
        const CODIGO_MAQUINA = (req.query["CODIGO_MAQUINA"] as string).trim() || undefined;
        const NUMERO_OPERACAO = (req.query["NUMERO_OPERACAO"] as string).trim() || undefined;
        // SQL QUERY TO (
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
            res.redirect("/#/ferramenta")
        } catch (error) {
            console.log(error);
        } finally {
            console.log("ODF FEED finalizado")
            await connection.close()
            next()
        }
    })


apiRouter.route("/IMAGEM")
    .get(async (req, res) => {
        const NUMPEC = req.cookies["CODIGO_PECA"]
        const connection = await mssql.connect(sqlConfig);
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
                const imgPath = pictures.getPicturePath(record["NUMPEC"], record["IMAGEM"]);
                return {
                    img: imgPath, // caminho da imagem (ex.: "")
                    razao: record["RAZAO"],
                    codigoInterno: record["NUMPEC"],
                    total: record["TOTAL"],
                }
            });
            res.json(result)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });


apiRouter.route("/HISTORICO")
    .get(async (req, res) => {
        let some = req.cookies["NUMERO_ODF"]
        const connection = await mssql.connect(sqlConfig);
        try {
            const resource = await connection.query(`
            SELECT
            *
            FROM VW_APP_APONTAMENTO_HISTORICO
            WHERE 1 = 1
            AND [ODF] = ${some}
            `);
            res.json(resource)
            console.log(resource)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });



apiRouter.route("/ferramenta")
    .get(async (req, res, next) => {
        var APT_TEMPO_OPERACAO: any = req.query["APT_TEMPO_OPERACAO"]
        var secondSetup = performance.now()
        const tools = 0

        //Encerra a primeira parte do Setup 
        const getSecondTimer = req.cookies["secondSetup"]
        var ffSetup = getSecondTimer - secondSetup;
        APT_TEMPO_OPERACAO = ffSetup

        //Inicia o processo de Produção
        var processSetup = performance.now()
        res.cookie("processSetup", processSetup)

        const connection = await mssql.connect(sqlConfig);
        try {
            //Verifica se houve um resultado em resource e caso haja redireciona
            if (tools === 0) {
                //Insere o resultado do tempo no banco
                const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + APT_TEMPO_OPERACAO + ')')
                console.log(insertSql)
                console.log("Tempo de Ferramenta: " + APT_TEMPO_OPERACAO)
                res.redirect(`/#/ferramenta`)
            } else {
                res.redirect(`/#/ferramenta`)
            }
        } catch (error) {
            console.log(error);
        } finally {
            console.log("get FERRAMENTA finalizado")
            await connection.close()
            return next();
        }
    })
    //GET das Fotos das ferramentas
    .get(async (req, res) => {
        const CODIGO = req.cookies["CODIGO_PECA"]
        const connection = await mssql.connect(sqlConfig);
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
                const imgPath = pictures.getPicturePath(record["CODIGO"], record["IMAGEM"]);
                return {
                    img: imgPath, // caminho da imagem (ex.: "")
                    razao: record["RAZAO"],
                    codigoInterno: record["CODIGO"],
                    total: record["TOTAL"],
                }
            });
            if (result.length > 0) {
                res.json()
            } else {
                res.redirect("/#/apontamento")
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });


apiRouter.route("/apontar")
    .post(
        async (req, _res, next) => {
            let resource1 = 0;
            let resource2 = 0;
            let resource3 = 0;

            let enviado = resource1 + resource2 + resource3

            function getEnviado() {

            }

            req.body = sanitize(req.body.trim());
            let status = '';
            let goodFeed = 1
            let badFeed = 1
            let NUMERO_ODF = 548548
            let NUMERO_OPERACAO = "'50'"
            let CODIGO_MAQUINA = "'LASO1'"
            let EMPRESA_RECNO = 1
            let QTDE_APONTADA = 1
            let QTD_REFUGO = 1
            let CST_PC_FALTANTE = 1;
            let CST_QTD_RETRABALHADA = 1;

            //Sanitizaão de input
            function sanitize(input: string) {
                const allowedChars = /[A-Za-z0-9]/;
                return input
                    .split("")
                    .map((char) => (allowedChars.test(char) ? char : ""))
                    .join("");
            }

            //INSERIR VALOR PREVIO PARA CASO HAJA UM VALOR PARCIAL/INICIAL
            // var preventValue;

            // if(!preventValue){
            //     preventValue + goodFeed
            //     return goodFeed
            // }

            var APT_TEMPO_OPERACAO: any = req.query["APT_TEMPO_OPERACAO"]
            const connection = await mssql.connect(sqlConfig);
            try {
                if (CST_PC_FALTANTE > 0 || CST_QTD_RETRABALHADA > 0) {
                    const insertSqlRework = await connection.query('INSERT INTO HISAPONTA(CST_PC_FALTANTE, CST_QTD_RETRABALHADA) VALUES (' + CST_PC_FALTANTE + ',' + CST_QTD_RETRABALHADA + ')')
                } else {
                    //Ajustar para receber os dados do front
                    const insertSql = await connection.query('INSERT INTO PCP_PROGRAMACAO_PRODUCAO(NUMERO_ODF,NUMERO_OPERACAO,CODIGO_MAQUINA,EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO) VALUES (' + NUMERO_ODF + ',' + NUMERO_OPERACAO + ',' + CODIGO_MAQUINA + ',' + EMPRESA_RECNO + ',' + QTDE_APONTADA + ',' + QTD_REFUGO + ')')
                }
                //Encerra A Segunda Fase do Setup
                const processSetup = req.cookies["processSetup"]
                var endTimer = performance.now();
                var secondSetup = processSetup - endTimer;
                APT_TEMPO_OPERACAO = secondSetup

                const insertSqlTimer = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + APT_TEMPO_OPERACAO + ')')

                //Inicia o Timer da Rip
                var ripTimer = performance.now()
                _res.cookie("ripTimer", ripTimer)
                _res.redirect(`/#/rip`)
            } catch (error) {
                _res.redirect(`/#/rip`)
            } finally {
                await connection.close()
                next()
            }
        }
    )
apiRouter.route("/rip")
    .get(async (req, _res) => {
        //Após inserir os dados na tabela, encerra o tempo da rip e finaliza
        var APT_TEMPO_OPERACAO: any = req.query["APT_TEMPO_OPERACAO"]
        var APT_TEMPO_OPERACAO_TOTAL: any = req.query["APT_TEMPO_OPERACAO"]


        const connection = await mssql.connect(sqlConfig);
        try {
            const ripTimer = req.cookies["ripTimer"]
            var endTimer = performance.now();
            var finalRipTimer = ripTimer - endTimer;
            APT_TEMPO_OPERACAO = finalRipTimer

            const secondSetup = req.cookies["secondSetup"]
            var endTimer = performance.now();
            var finalsecondSetup = secondSetup - endTimer;
            APT_TEMPO_OPERACAO_TOTAL = finalsecondSetup

            // Insert com o tempo final no banco
            const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + APT_TEMPO_OPERACAO + ')')
            console.log(insertSql)
            console.log("Rip: " + APT_TEMPO_OPERACAO)

            const insertSql2 = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + APT_TEMPO_OPERACAO_TOTAL + ')')
            console.log(insertSql2)
            console.log("Completo: " + APT_TEMPO_OPERACAO_TOTAL)

        } catch (error) {
            console.log(error)
        } finally {
            console.log("RIP finalizada")
            //Encerra Conexão com banco
            await connection.close()
        }

    })


apiRouter.route("/desenho")
    //GET das Fotos das ferramentas
    .get(async (req, res) => {
        const NUMPEC = req.cookies["CODIGO_PECA"]
        const connection = await mssql.connect(sqlConfig);
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
                const imgPath = pictures.getPicturePath(record["NUMPEC"], record["IMAGEM"]);
                return {
                    img: imgPath, // caminho da imagem (ex.: "")
                    razao: record["RAZAO"],
                    codigoInterno: record["NUMPEC"],
                    total: record["TOTAL"],
                }
            });
            res.json(result);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: true, message: "Erro no servidor." });
        } finally {
            await connection.close()
        }
    });
export default apiRouter;