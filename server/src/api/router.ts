import { Router } from "express";
import mssql from "mssql";
import { sqlConfig } from "../global.config";

const apiRouter = Router();

// /api/v1/

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
            const tool = 0
            
            if (barcode === "") throw new Error("Código de barras inválido")

            const dados = {
                numOdf: Number(barcode.slice(10)),
                numOper: barcode.slice(0, 5),
                codMaq: barcode.slice(5, 10),
            }
            // AO BIPAR INICIA 
            // let inicialSetup = ""
            // const dados2 = {
            //     inicialSetup: inicialSetup
            // }

            // ,
            //         (
            //             SELECT TOP 1
            //             [APT_TEMPO_OPERACAO]
            //             FROM HISAPONTA
            //             WHERE 1 = 1
            //             AND [APT_TEMPO_OPERACAO] = ${dados2.inicialSetup}
            //             ORDER BY CAST(LTRIM(NUMOPE) AS INT) ASC
            //         )

            const connection = await mssql.connect(sqlConfig);
            try {
                const resource = await connection.query(`
                    SELECT TOP 1
                    [NUMERO_ODF], 
                    [CODIGO_MAQUINA],
                    [NUMERO_OPERACAO]
                    FROM PCP_PROGRAMACAO_PRODUCAO
                    WHERE 1 = 1
                    AND [NUMERO_ODF] = ${dados.numOdf}
                    AND [CODIGO_MAQUINA] = '${dados.codMaq}'
                    AND [NUMERO_OPERACAO] = ${dados.numOper}
                    ORDER BY NUMERO_OPERACAO ASC
                    `.trim()
                ).then(result => result.recordset);



                console.log(resource)
                //LOCAL STORAGE >>
                // function setValues (){
                //     let value = ""
                //     var values = value;
                //     localStorage.setItem("barcodeData", values)
                //   }

                if (resource.length > tool) {
                    //Regra de negocio(INICIO DE SETUP)


                    // setValues()
                    res.redirect(`/#/ferramenta`)
                } else {
                    res.redirect(`/#/codigobarras`)
                }
            } catch (error) {
                console.log(error);
            } finally {
                await connection.close();
                next()
            }
        }
    )
    .get(async (req, res, next) => {
        console.log("GET iniciado")
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
            console.log("SELECT iniciado")
            const resource: any = await connection.query(`
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
                [HORA_FIM],
                [CODIGO_PECA]
                FROM PCP_PROGRAMACAO_PRODUCAO
                WHERE 1 = 1
                AND [NUMERO_ODF] = ${NUMERO_ODF}
                AND [CODIGO_MAQUINA] = '${CODIGO_MAQUINA}'
                AND [NUMERO_OPERACAO] = ${NUMERO_OPERACAO}
                ORDER BY NUMERO_OPERACAO ASC`.trim()).then(result => result.recordset);
            console.log("SELECT finalizado")
            res.json(resource);
        } catch (error) {
            console.log(error);
        } finally {
            console.log("GET finalizado")
            await connection.close()
            next()
        }
    },
        // async (req, res, next) => {
        //     console.log("GET barra de status iniciado")
        //     const connection = await mssql.connect(sqlConfig);
        //     let status = req.query["status"];

        //     const dados2 = {
        //         apontaTempo: status
        //     }

        //     try {
        //         const resource = await connection.query(`
        //         SELECT TOP 1
        //         [APT_TEMPO_OPERACAO]
        //         FROM HISAPONTA
        //         WHERE 1 = 1
        //         AND [APT_TEMPO_OPERACAO] = ${dados2.apontaTempo}
        //         ORDER BY CAST(LTRIM(NUMOPE) AS INT) ASC
        //         `.trim()).then(result => result.recordset);
        //         console.log(resource)
        //         res.json(resource);
        //     } catch (error) {
        //         console.log(error)
        //     } finally {
        //         await connection.close()
        //         next()
        //     }
        // }
    )
apiRouter.route("/apontar")
    .post(
        async (req, _res, next) => {
            console.log("POST iniciado")
            const connection = await mssql.connect(sqlConfig);
            const status = '';
            const goodFeed = req.body["goodFeed"] = sanitize(req.body["goodFeed"].trim());
            const badFeed = req.body["badFeed"] = sanitize(req.body["badFeed"].trim());
            const NUMERO_ODF = 599998
            const NUMERO_OPERACAO = "'50'"
            const CODIGO_MAQUINA = "'LASO1'"
            const EMPRESA_RECNO = 1
            const QTDE_APONTADA = 1
            const QTD_REFUGO = 1

            const dados2 = {
                apontaTempo: status
            }

            //Sanitizaão de input
            function sanitize(input: string) {
                const allowedChars = /[A-Za-z0-9]/;
                return input
                    .split("")
                    .map((char) => (allowedChars.test(char) ? char : ""))
                    .join("");
            }
            console.log("esse é os bons: " + goodFeed)
            console.log("esse é os ruins: " + badFeed)
            //


            //INSERIR VALOR PREVIO PARA CASO HAJA UM VALOR PARCIAL/INICIAL
            // var preventValue;

            //Logica de negocio
            // if (goodFeed === "" || badFeed === "") {
            //     goodFeed = 0
            //     badFeed = 0
            // }

            // if(!preventValue){
            //     preventValue + goodFeed
            //     return goodFeed
            // }

            // if(badFeed === QTD_ODF){
                //     console.log("serviço Incompleto")
                //     return badFeed
                // }


                // AO APONTAR ENCERRA A PRODUÇÃO FINAL
                // const resource = await connection.query(`
                // SELECT TOP 1
                // [APT_TEMPO_OPERACAO]
                // FROM HISAPONTA
                // WHERE ODF = '329682' order by DATAHORA asc
                // `.trim()).then(result => result.recordset);
            //Ta funcionando
            try {
                const insertSql = await connection.query('INSERT INTO PCP_PROGRAMACAO_PRODUCAO(NUMERO_ODF,NUMERO_OPERACAO,CODIGO_MAQUINA,EMPRESA_RECNO, QTDE_APONTADA, QTD_REFUGO) VALUES (' + NUMERO_ODF + ',' + NUMERO_OPERACAO + ',' + CODIGO_MAQUINA + ',' + EMPRESA_RECNO + ',' + QTDE_APONTADA + ',' + QTD_REFUGO + ')')
                console.log("deu")
                console.log(dados2.apontaTempo)
                // console.log(resource)
                console.log(insertSql)
                _res.redirect(`/#/rip`)
            } catch (error) {
                console.log(error)
                _res.redirect(`/#/rip`)
            } finally {
                console.log("POST finalizado")
                await connection.close()
                next()
            }
        }
    )
export default apiRouter;