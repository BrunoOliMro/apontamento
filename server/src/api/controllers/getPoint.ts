import e, { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";

export const getPoint: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let NUMERO_ODF = Number(sanitize(req.cookies["NUMERO_ODF"])) || 0
    let qtdBoas = Number(sanitize(req.body["valorFeed"])) || 0;
    const NUMERO_OPERACAO = req.cookies['NUMERO_OPERACAO']
    const CODIGO_MAQUINA = req.cookies['CODIGO_MAQUINA']
    let codigoPeca = String(sanitize(req.cookies['CODIGO_PECA'])) || null
    let funcionario = String(sanitize(req.cookies['FUNCIONARIO'])) || null
    var address;
    const hostname = req.get("host")
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results: any = {}; // Or just '{}', an empty object
    var obj: any = {}
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    const ip = String(Object.entries(results)[0]![1])

    try {
        //Caso a operação seja 999 fará baixa no estoque
        if (NUMERO_OPERACAO === "00999") {
            //Caso seja diferente de "EX"
            if (CODIGO_MAQUINA !== 'EX002') {
                const s = await connection.query(`
                    SELECT 
                    EE.CODIGO AS COD_PRODUTO, NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                    FROM 
                    CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}') 
                        ORDER BY CE.ENDERECO ASC`)
                    .then(result => result.recordset)

                const e = await connection.query(`
                    SELECT 
                    EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                    FROM 
                    CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE 
                    ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}') 
                    ORDER BY CE.ENDERECO ASC`)
                    .then(result => result.recordset)

                const add = (s.map((callback) => callback.QUANTIDADE))
                const ç = (e.map((callback) => callback.QUANTIDADE))
                var choice: any;
                var resChoice: any;

                if (add.length > 0) {
                    obj = s
                    choice = add
                    resChoice = add
                } else if (ç.length > 0) {
                    obj = e
                    choice = ç
                    resChoice = ç
                }

                let smallerNumber = Math.min(...choice)
                let indiceDoArrayDeOdfs: number = choice.findIndex((callback: any) => callback === smallerNumber)
                obj = resChoice[indiceDoArrayDeOdfs]
                address = resChoice[indiceDoArrayDeOdfs].ENDERECO
                console.log("linha 76", obj);
            }

            //Caso seja igual de "EX"
            if (CODIGO_MAQUINA === 'EX002') {
                const exResource = await connection.query(`
                    SELECT
                    EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                    FROM 
                    CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE 
                    ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '7%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}')
                    ORDER BY CE.ENDERECO ASC`)
                    .then(result => result.recordset)

                let l = await connection.query(`
                    SELECT 
                    EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                    FROM 
                    CST_CAD_ENDERECOS CE(NOLOCK)
                    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                    WHERE 
                    ISNULL(EE.QUANTIDADE,0) <= 0 AND CE.ENDERECO LIKE '7%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}')
                    ORDER BY CE.ENDERECO ASC`)
                    .then(result => result.recordset)
                const add = (exResource.map((callback) => callback.QUANTIDADE))
                const ç = (l.map((callback) => callback.QUANTIDADE))
                var choice: any;
                var resChoice: any;

                if (add.length > 0) {
                    obj = exResource
                    choice = add
                    resChoice = exResource
                } else if (ç.length > 0) {
                    obj = l
                    choice = ç
                    resChoice = l
                }

                let smallerNumber = Math.min(...choice)
                let indiceDoArrayDeOdfs: number = choice.findIndex((callback: any) => callback === smallerNumber)
                address = resChoice[indiceDoArrayDeOdfs].ENDERECO
                //console.log("linha 119", address);
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: 'erro ao em localizar espaço' })
    }


    try {
        const hisReal = await connection.query(`SELECT TOP 1  * FROM HISREAL  WHERE 1 = 1 AND CODIGO = '${codigoPeca}' ORDER BY DATA DESC`)
            .then(record => record.recordset)
        try {
            const insertHisReal = await connection.query(`
                INSERT INTO HISREAL
                    (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
                SELECT 
                    CODIGO, '${NUMERO_ODF}/${codigoPeca}', GETDATE(), ${qtdBoas}, 0 , 'E', ${hisReal[0].SALDO} + ${qtdBoas}, GETDATE(), '0', '${funcionario}', '${NUMERO_ODF}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
                FROM ESTOQUE(NOLOCK)
                WHERE 1 = 1 
                AND CODIGO = '${codigoPeca}' 
                GROUP BY CODIGO`)
                //.then(result => result.recordset)
            console.log("LINHA 106", insertHisReal);
        } catch (error) {
            console.log('linha 103', error);
        }
        try {
            if (CODIGO_MAQUINA === 'EX002') {
                await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${codigoPeca}'`)
            } else {
                await connection.query(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${codigoPeca}'`)
            }
            return res.json(address)
        } catch (error) {
            console.log(error);
            return res.json({ message: 'erro ao inserir estoque' })
        }
    } catch (error) {
        console.log('linha 107', error);
        return res.json({ message: 'erro ao localizar os dados em hisreal' })
    }
}