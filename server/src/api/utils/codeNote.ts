import { message } from "../services/message"
import { select } from "../services/select"

// odfNumber: number | null, operationNumber: number | null, codeMachine: string | null, employee: string | null
// const lookForHisaponta = `SELECT TOP 1 CODAPONTA, USUARIO, DATAHORA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${obj.odfNumber} AND NUMOPE = ${obj.operationNumber} AND ITEM = '${obj.codeMachine}' ORDER BY DATAHORA DESC`
export const codeNote = async (obj: any) => {
    var response: any = {
        employee: '',
        code: '',
        time: 0,
    }
    const codigoDeApontamento = await select(23, obj)
    if (codigoDeApontamento.length > 0) {
        response.time = codigoDeApontamento[0].DATAHORA

        if (obj.employee !== codigoDeApontamento[0].USUARIO && codigoDeApontamento[0].CODAPONTA === 4) {
            response.employee = codigoDeApontamento[0].USUARIO
        }

        const codes: any = {
            0: 'Error',
            1: 'Pointed Iniciated',
            2: 'Fin Setup',
            3: 'Ini Prod',
            4: 'Pointed',
            5: 'Rip iniciated',
            6: 'Begin new process',
            7: 'Machine has stopped',
            8: 'A value was returned',
        }

        obj.number.forEach((element: any) => {
            Object.entries(codes).map((acc) => {
                if (Number(element) === Number(acc[0])) {
                    response.code = acc[1]

                }
            })
        });

        return response
    } else if (codigoDeApontamento.length <= 0) {
        response.message = message(24)
        return response
    } else {
        response.message = message(0)
        return response
    }

}