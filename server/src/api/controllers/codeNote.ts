import { RequestHandler } from 'express';
import mssql from 'mssql';
import { sqlConfig } from '../../global.config';
import { unravelBarcode } from '../utils/unravelBarcode';

export const codeNote: RequestHandler = async (req, res, next) => {
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
            ORDER BY DATAHORA DESC
            `)
            .then(result => result.recordset);

        console.log('linha 23 codeNote', resource);

        if (resource.length > 0) {
            if (resource[0]?.CODAPONTA === 1) {
                req.body.message = 'codeApont 1 setup iniciado'
                next()
                //return res.json({ message: `codeApont 1 setup iniciado` })
            }
            if (resource[0]?.CODAPONTA === 2) {
                req.body.message = 'codeApont 2 setup finalizado'
                next()
                //return res.json({ message: `codeApont 2 setup finalizado` })
            }
            if (resource[0]?.CODAPONTA === 3) {
                req.body.message = 'codeApont 3 prod iniciado'
                next()
                //return res.json({ message: `codeApont 3 prod iniciado` })
            }
            if (resource[0]?.CODAPONTA === 4) {
                req.body.message = 'codeApont 4 prod finalzado'
                next()
                //return res.json({ message: `codeApont 4 prod finalzado` })
            }
            if (resource[0]?.CODAPONTA === 5) {
                req.body.message = 'codeApont 5 maquina parada'
                next()
                //return res.json({ message: `codeApont 5 maquina parada` })
            }
            if (resource[0]?.CODAPONTA === 6) {
                req.body.message = 'codeApont 6 processo finalizado'
                next()
                //return res.json({ message: `codeApont 6 processo finalizado` })
            }
            if (!resource[0]?.CODAPONTA) {
                req.body.message = `qualquer outro codigo`
                next()
            }
        }
        if (resource.length <= 0) {
            next()
        }
    } catch (error) {
        return res.json({ message: 'algo deu errado ao buscar pelo codigo de apontamento' })
    } finally {
        //await connection.close()
    }
}