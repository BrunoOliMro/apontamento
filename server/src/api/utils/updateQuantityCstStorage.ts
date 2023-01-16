import { insertInto } from "../services/insert";
import { sqlConfig } from "../../global.config"
import { message } from "../services/message";
import { select } from "../services/select"
import { update } from "../services/update"
import mssql from 'mssql';


export const cstStorageUp = async (quantityToProduce: any, address: any, partCode: any, odfNumber: any, goodFeed: any, employee: any, hostname: any, ip: any) => {
    const response = {
        message: '',
        address: ''
    }
    try {
        // const updateStringCadEnderecos = `UPDATE CST_ESTOQUE_ENDERECOS SET QUANTIDADE = QUANTIDADE + ${quantityToProduce} WHERE 1 = 1 AND ENDERECO = '${address}'`
        const x = await update(4, {quantityToProduce, address } )
        if (x !== 'Success') {
            const y = `INSERT INTO CST_ESTOQUE_ENDERECOS(ENDERECO, CODIGO ,QUANTIDADE) VALUES ('${address}','${partCode}' , ${quantityToProduce})`
            // INSERT INTO!!!!!!!!!!!
            // await insertInto({})
            // await update(y)
        }
        // const lookForHisReal = `SELECT TOP 1  * FROM HISREAL  WHERE 1 = 1 AND CODIGO = '${partCode}' ORDER BY DATA DESC`
        const resultQuery = await select(29, {partCode})
        if (!resultQuery) {
            return message(0)
        }
        const connection = await mssql.connect(sqlConfig);
        try {
            await connection.query(`
        INSERT INTO HISREAL
            (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
        SELECT 
            CODIGO, '${odfNumber}/${partCode}', GETDATE(), ${goodFeed}, 0 , 'E', ${resultQuery[0].SALDO} + ${goodFeed}, GETDATE(), '0', '${employee}', '${odfNumber}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
        FROM ESTOQUE(NOLOCK)
        WHERE 1 = 1 
        AND CODIGO = '${partCode}' 
        GROUP BY CODIGO`).then(result => result.rowsAffected)
        } catch (error) {
            console.log('linha 194', error);
            return response.message = 'erro inserir em hisreal'
        } finally {
            await connection.close()
        }
    } catch (error) {
        console.log('Error on updating ', error);
        return message(0)
    }
}