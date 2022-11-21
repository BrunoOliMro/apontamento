import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";
import { select } from "../services/select";
import { selectAddress } from "../services/selectAddress";
import { update } from "../services/update";
import { decrypted } from "../utils/decryptedOdf";

export const getPoint: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let NUMERO_ODF = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let qtdBoas = decrypted(String(sanitize(req.cookies["qtdBoas"]))) || null;
    const NUMERO_OPERACAO = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const CODIGO_MAQUINA = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    let codigoPeca = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
    let funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const updateQuery = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + (CAST('${qtdBoas}' AS decimal(19, 6))) WHERE 1 = 1 AND CODIGO = '${codigoPeca}'`
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
    console.log("linha 39", NUMERO_OPERACAO);
    try {
        //Caso a operação seja 999 fará baixa no estoque
        if (NUMERO_OPERACAO === "00999") {
            //Caso seja diferente de "EX"
            let addressValues: any;
            if (CODIGO_MAQUINA !== 'EX002') {
                addressValues = await selectAddress(codigoPeca, 5)
                addressValues = await selectAddress(codigoPeca, 7)
                console.log("linha 48 /getPoint/", addressValues);

                // const s = await connection.query(`
                //     SELECT 
                //     EE.CODIGO AS COD_PRODUTO, NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                //     FROM 
                //     CST_CAD_ENDERECOS CE(NOLOCK)
                //     LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                //     WHERE 
                //     ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}') 
                //         ORDER BY CE.ENDERECO ASC`)
                //     .then(result => result.recordset)

                // const e = await connection.query(`
                //     SELECT 
                //     EE.CODIGO AS COD_PRODUTO,NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
                //     FROM 
                //     CST_CAD_ENDERECOS CE(NOLOCK)
                //     LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
                //     WHERE 
                //     ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '5%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}') 
                //     ORDER BY CE.ENDERECO ASC`)
                //     .then(result => result.recordset)

                const add = (addressValues.map((callback: any) => callback.QUANTIDADE))
                const ç = (addressValues.map((callback: any) => callback.QUANTIDADE))
                var choice: any;
                var resChoice: any;

                if (add.length > 0) {
                    obj = addressValues
                    choice = add
                    resChoice = add
                } else if (ç.length > 0) {
                    obj = addressValues
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
                addressValues = await selectAddress(codigoPeca, 7)
                addressValues = await selectAddress(codigoPeca, 7)
                console.log("linha 96 /getPoint/", addressValues);

                const add = (addressValues.map((callback: any) => callback.QUANTIDADE))
                const ç = (addressValues.map((callback: any) => callback.QUANTIDADE))
                var choice: any;
                var resChoice: any;

                if (add.length > 0) {
                    obj = addressValues
                    choice = add
                    resChoice = addressValues
                } else if (ç.length > 0) {
                    obj = addressValues
                    choice = ç
                    resChoice = addressValues
                }

                let smallerNumber = Math.min(...choice)
                let indiceDoArrayDeOdfs: number = choice.findIndex((callback: any) => callback === smallerNumber)
                address = resChoice[indiceDoArrayDeOdfs].ENDERECO
                //console.log("linha 119", address);
            }
            try {
                // const hisReal = await connection.query(`SELECT TOP 1  * FROM HISREAL  WHERE 1 = 1 AND CODIGO = '${codigoPeca}' ORDER BY DATA DESC`)
                //     .then(record => record.recordset)

                const lookForHisReal = `SELECT TOP 1  * FROM HISREAL  WHERE 1 = 1 AND CODIGO = '${codigoPeca}' ORDER BY DATA DESC`
                const resultQuery = await select(lookForHisReal)
                try {
                    const insertHisReal = await connection.query(`
                INSERT INTO HISREAL
                    (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
                SELECT 
                    CODIGO, '${NUMERO_ODF}/${codigoPeca}', GETDATE(), ${qtdBoas}, 0 , 'E', ${resultQuery[0].SALDO} + ${qtdBoas}, GETDATE(), '0', '${funcionario}', '${NUMERO_ODF}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
                FROM ESTOQUE(NOLOCK)
                WHERE 1 = 1 
                AND CODIGO = '${codigoPeca}' 
                GROUP BY CODIGO`).then(result => result.rowsAffected)
                    console.log("LINHA 106", insertHisReal);
                } catch (error) {
                    console.log('linha 103', error);
                    return res.json({ message: 'erro inserir em hisreal' })
                }

                console.log("linha 160 /getPoint/", NUMERO_OPERACAO);
                try {
                    console.log("linha 144 /getPoint/");
                    if (NUMERO_OPERACAO === "00999") {
                        const x = await update(updateQuery)
                        console.log("linha 146 /getPoint/", x);
                    } 

                    let objRes: any = {
                        address: address,
                        String: 'endereço com sucesso'
                    }
                    if (address === undefined) {
                        return res.json({ message: 'sem endereço' })
                    } else {
                        return res.json(objRes)
                    }
                } catch (error) {
                    console.log(error);
                    return res.json({ message: 'erro ao inserir estoque' })
                }

            } catch (error) {
                console.log(error);
                return res.json({ message: 'erro ao em localizar espaço' })
            }
        } else {
            return res.json({ message: 'sem endereço' })
        }
    } catch (error) {
        console.log('linha 107', error);
        return res.json({ message: 'erro ao localizar os dados em hisreal' })
    }
}
