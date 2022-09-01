import { Router } from "express";
import mssql from "mssql";
import { sqlConfig } from "../global.config";
import { pictures } from "./pictures";

const apiRouter = Router();

// /api/v1/

apiRouter.route("/apontamentoCracha")
    .post(async (req, res, next) => {
        let maxRange = 600000
        //Sanitizar codigo
        let MATRIC: any = (req.body["MATRIC"] as string).trim()
        res.cookie("MATRIC", MATRIC, { httpOnly: true, maxAge: maxRange })

        if (MATRIC === "") {
            res.redirect(`/#/codigobarras`)
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

                    res.cookie("MATRIC", resource[0].MATRIC)
                    res.cookie("FUNCIONARIO", resource[0].FUNCIONARIO)

                    res.redirect("/#/codigobarras")
                    return next()
                } else {
                    res.redirect("/#/codigobarras")
                    return next()
                }
            } catch (error) {
                console.log(error)
            } finally {
                await connection.close()
                next()
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

                    res.cookie("NUMERO_ODF", resource[0].NUMERO_ODF)
                    res.cookie("CODIGO_MAQUINA", resource[0].CODIGO_MAQUINA)

                    res.cookie("NUMERO_OPERACAO", resource[0].NUMERO_OPERACAO)
                    res.cookie("CODIGO_PECA", resource[0].CODIGO_PECA)

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
        let NUMERO_ODF: any = (req.query["NUMERO_ODF"] as string).trim() || undefined;
        let CODIGO_MAQUINA = (req.query["CODIGO_MAQUINA"] as string).trim() || undefined;
        let NUMERO_OPERACAO = (req.query["NUMERO_OPERACAO"] as string).trim() || undefined;

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
        } catch (error) {
            console.log(error);
        } finally {
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
            res.status(500).json({ error: true, message: "Erro no servidor." });
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
        console.log(mili / 1000)
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
            //  req.body = sanitize(req.body.trim());
            let status = '';
            let NUMERO_ODF = req.cookies["NUMERO_ODF"]
            let NUMERO_OPERACAO = req.cookies["NUMERO_OPERACAO"]
            let CODIGO_MAQUINA = req.cookies["CODIGO_MAQUINA"]
            let EMPRESA_RECNO = 1
            let QTDE_APONTADA = req.body["goodFeed"]
            let QTD_REFUGO = req.body["badfeed"]
            let CST_PC_FALTANTE = req.body["reworkFeed"];
            let CST_QTD_RETRABALHADA = req.body["missingFeed"];

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

            const connection = await mssql.connect(sqlConfig);
            try {
                //Encerra tempo de produção
                let endProdTimer = new Date();
                let startProd = req.cookies["startProd"]
                let finalProdTimer = endProdTimer.getTime() - Number(startProd)
                console.log("Primeira operação: " + finalProdTimer / 1000 + " segundos")


                //Inicia tempo de Rip
                let startRip = new Date();
                let mili = startRip.getMilliseconds();
                console.log(mili / 1000)
                _res.cookie("startRip", startRip.getTime())

                // if (CST_PC_FALTANTE > 0 || CST_QTD_RETRABALHADA > 0) {
                const insertSqlRework = await connection.query('INSERT INTO HISAPONTA(CST_PC_FALTANTE, CST_QTD_RETRABALHADA) VALUES (' + CST_PC_FALTANTE + ',' + CST_QTD_RETRABALHADA + ')')
                // } else {

                //Ajustar para receber os dados do front
                const insertSql = await connection.query('INSERT INTO PCP_PROGRAMACAO_PRODUCAO(NUMERO_ODF,NUMERO_OPERACAO,CODIGO_MAQUINA,EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO) VALUES (' + NUMERO_ODF + ',' + NUMERO_OPERACAO + ',' + CODIGO_MAQUINA + ',' + EMPRESA_RECNO + ',' + QTDE_APONTADA + ',' + QTD_REFUGO + ')')
                console.log(insertSql)
                // }

                const insertSqlTimer = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdTimer + ')')

                _res.redirect(`/#/rip`)
                return next()
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
        const connection = await mssql.connect(sqlConfig);
        try {
            //Encerra o processo todo
            let end = new Date();
            let start = req.cookies["starterBarcode"]
            let final = end.getTime() - Number(start)

            // Encerra ao final da Rip
            let endProdRip = new Date();
            let startRip = req.cookies["startRip"]
            let finalProdRip = endProdRip.getTime() - Number(startRip)

            // Insert com o tempo final no banco
            const insertSql = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + finalProdRip + ')')
            console.log("Rip: " + finalProdRip / 1000 + " segundos")

            const insertSql2 = await connection.query('INSERT INTO HISAPONTA(APT_TEMPO_OPERACAO) VALUES (' + final + ')')
            console.log("Completo: " + final / 1000 + " segundos")
        } catch (error) {
            console.log(error)
        } finally {
            await connection.close()
        }
    })


apiRouter.route("/desenho")
    //GET das Fotos das ferramentas
    .get(async (req, res) => {
        let end = new Date();
        let start = req.cookies["start"]
        let final = end.getTime() - Number(start)
        console.log("operação: " + final + " milisegundos")

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