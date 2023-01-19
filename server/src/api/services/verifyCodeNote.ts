import { selectQuery } from "./query";
import { message } from "./message";

export const verifyCodeNote = async (values: any, acceptableStrings?: number[]) => {
    const codes: {[key: string]: string} = {
        0: 'Error',
        1: 'Pointed Iniciated',
        2: 'Fin Setup',
        3: 'Ini Prod',
        4: 'Pointed',
        5: 'Rip iniciated',
        6: 'Begin new process',
        7: 'Machine has stopped',
        8: 'A value was returned',
        9: 'First time acessing ODF',
    }

    const response: any = {
        employee: '',
        code: '',
        time: 0,
        accepted: message(33),
    }

    let resultCodes = await selectQuery(23, values)

    if (resultCodes.data!.length > 0) {
        response.time = resultCodes.data![0].DATAHORA
        response.employee = values.FUNCIONARIO

        if (values.FUNCIONARIO !== resultCodes.data![0].USUARIO && resultCodes.data![0].CODAPONTA === 4) {
            response.employee = resultCodes.data![0].USUARIO
        }

        response.code = codes[String(resultCodes.data![0].CODAPONTA)]

        acceptableStrings?.forEach(acc => {
            if (Number(resultCodes.data![0].CODAPONTA) === acc) {
                response.accepted = message(1)
            }
        })

        return response
    } else {
        response.code = codes[6]
        response.accepted = message(1)
        return response
    }
}