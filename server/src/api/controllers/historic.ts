import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const historic: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let NUMERO_ODF = Number(sanitize(req.cookies["NUMERO_ODF"]))
    let resultPeçasBoas;
    try {
        const resource = await connection.query(`
        SELECT
        *
        FROM VW_APP_APONTAMENTO_HISTORICO_DETALHADO
        WHERE 1 = 1
        AND ODF = '${NUMERO_ODF}'
        ORDER BY DATAHORA DESC
        `.trim()).then(result => result.recordset)

        const resourceDetail = await connection.query(`
        SELECT
        *
        FROM VW_APP_APONTAMENTO_HISTORICO
        WHERE 1 = 1
        AND ODF = '${NUMERO_ODF}'
        ORDER BY OP ASC
        `.trim()).then(result => result.recordset)


        let obj: any = []

        for (const iterator of resource) {
            if(iterator.BOAS > 0){
                obj.push(iterator)
            } 
            if(iterator.REFUGO > 0){
                obj.push(iterator)
            }
        }

        resultPeçasBoas = resource.reduce((acc: any, iterator: any) => {
            return acc + iterator.BOAS + iterator.REFUGO
        }, 0)

        console.log("linha 35", obj);

        if(resultPeçasBoas > 0){
            let objRes = {
                resourceDetail : resourceDetail,
                resource: obj,
                message: 'Exibir histórico'
            }
            return res.json(objRes)
        } 
        if(resultPeçasBoas <= 0){
            return res.json({message: 'Não há histórico a exibir'})
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'Error ao localizar o histórico' });
    } finally {
        //await connection.close()
    }
}