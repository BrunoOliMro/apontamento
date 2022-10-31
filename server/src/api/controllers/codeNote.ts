import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { unravelBarcode } from "../utils/unravelBarcode";

export const codeNote: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let dados: any = unravelBarcode(req.body.codigoBarras)

    try {
        const resource = await connection.query(`
            SELECT 
            TOP 1 
            CODAPONTA 
            FROM 
            HISAPONTA 
            WHERE 1 = 1 
            AND ODF = '${dados.numOdf}'
            AND NUMOPE = '${dados.numOper}'
            AND ITEM = '${dados.codMaq}'
            ORDER BY DATAHORA DESC`)
            .then(result => result.recordset);
        //console.log("linha 23 codeNote", resource);
        if (resource.length > 0) {
            if (resource[0]?.CODAPONTA === 1) {
                return res.json({ message: `codeApont 1 setup iniciado` })
            }
            if (resource[0]?.CODAPONTA === 2) {
                return res.json({ message: `codeApont 2 setup finalizado` })
            }
            if (resource[0]?.CODAPONTA === 3) {
                return res.json({ message: `codeApont 3 prod iniciado` })
            }
            if (resource[0]?.CODAPONTA === 4) {
                return res.json({ message: `codeApont 4 prod finalzado` })
            }
            if (resource[0]?.CODAPONTA === 5) {
                return res.json({ message: `codeApont 5 maquina parada` })
            }
            if (resource[0]?.CODAPONTA === 6) {
                return res.json({ message: `codeApont 6 processo finalizado` })
            } else {
                return res.json({ message: `qualquer outro codigo` })
            }
        } else {
            return res.json({ message: 'erro ao localizar o codigo apontamento' })
        }
    } catch (error) {
        return res.json({ message: 'algo deu errado ao buscar pelo codigo de apontamento' })
    } finally {
        //await connection.close()
    }
}