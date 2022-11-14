import { RequestHandler } from 'express';
import mssql from 'mssql';
import { sqlConfig } from '../../global.config';
import { unravelBarcode } from '../utils/unravelBarcode';

export const codeNote: RequestHandler = async (req, res, next) => {
    const connection = await mssql.connect(sqlConfig);
    let dados: any = unravelBarcode(req.body.codigoBarras)
    console.log("linha 7 code note", dados);

 
    const numeroOdf: number = Number(req.cookies['NUMERO_ODF']) || 0
    const codigoOper = req.cookies['NUMERO_OPERACAO']
    const codigoMaq = req.cookies['CODIGO_MAQUINA']
    const funcionario = req.cookies['FUNCIONARIO']

    // console.log('linha 16', numeroOdf);
    // console.log('linha 17', codigoOper);
    // console.log('linha 18', codigoMaq);

    try {
        const codIdApontamento = await connection.query(`
            SELECT 
            TOP 1
            USUARIO,
            ODF,
            NUMOPE, 
            ITEM,
            CODAPONTA 
            FROM 
            HISAPONTA 
            WHERE 1 = 1 
            AND ODF = ${dados.numOdf}
            AND NUMOPE = '${dados.numOper}'
            AND ITEM = '${dados.codMaq}'
            ORDER BY DATAHORA DESC
            `)
            .then(result => result.recordset);

            //console.log("linha 25 / codeNote /", codIdApontamento);
            //console.log('linha 37', codIdApontamento[0]?.ODF);

            let lastEmployee = codIdApontamento[0]?.USUARIO
            console.log('linha 44', funcionario);
            console.log("linha 45", lastEmployee );
            let numeroOdfDB = codIdApontamento[0]?.ODF
            let codigoOperDB = codIdApontamento[0]?.NUMOPE
            let codigoMaqDB = codIdApontamento[0]?.ITEM


            if(lastEmployee !== funcionario 
                && numeroOdf === numeroOdfDB 
                && codigoOper === codigoOperDB 
                && codigoMaq === codigoMaqDB
                ){
                console.log("usuario diferente");
                //codIdApontamento[0].CODAPONTA = 1
                return res.json({message : 'usuario diferente'})
            }

        if (codIdApontamento.length > 0) {
            if (codIdApontamento[0]?.CODAPONTA === 1) {
                req.body.message = 'codeApont 1 setup iniciado'
                next()
                //return res.json({ message: `codeApont 1 setup iniciado` })
            }
            if (codIdApontamento[0]?.CODAPONTA === 2) {
                //req.body.message = 'codeApont 2 setup finalizado'
               // next()
                //return res.json({ message: `codeApont 2 setup finalizado` })
            }
            if (codIdApontamento[0]?.CODAPONTA === 3) {
                //req.body.message = 'codeApont 3 prod iniciado'
                //next()
                return res.json({ message: `codeApont 3 prod iniciado` })
            }
            if (codIdApontamento[0]?.CODAPONTA === 4) {
                //req.body.message = 'codeApont 4 prod finalzado'
                //return res.json({message : 'codeApont 4 prod finalzado'})
                //next()
                //return res.json({ message: `codeApont 4 prod finalzado` })
            }
            if (codIdApontamento[0]?.CODAPONTA === 5) {
                req.body.message = 'codeApont 5 maquina parada'
                console.log('52', req.body.message);
                next()
                //return res.json({message : 'codeApont 5 maquina parada'})
                //return res.json({ message: `codeApont 5 maquina parada` })
            }
            if (codIdApontamento[0]?.CODAPONTA === 6) {
                //req.body.message = 'codeApont 6 processo finalizado'
                //next()
                return res.json({ message: `codeApont 6 processo finalizado` })
            }

            if (codIdApontamento[0]?.CODAPONTA === 7) {
                req.body.message = 'codeApont 7 estorno realizado'
                next()
                //return res.json({ message: `codeApont 6 processo finalizado` })
            }
            if (!codIdApontamento[0]?.CODAPONTA) {
                req.body.message = `qualquer outro codigo`
                next()
            }
        }
        if (codIdApontamento.length <= 0) {
            req.body.message = 'insira cod 1'
            next()
        }
    } catch (error) {
        return res.json({ message: 'algo deu errado ao buscar pelo codigo de apontamento' })
    } finally {
        //await connection.close()
    }
}