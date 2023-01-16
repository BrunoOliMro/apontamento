import { message } from "./message";
import { select } from "./select";

export const verifyCodeNote = async (values: any, acceptableStrings?: number[]) => {
    const codes = {
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
        message: '',
        time: 0,
        accepted: message(33),
    }

    let resultCodes = await select(23, values)
    console.log('resultCodes', resultCodes);
    if(resultCodes === message(0)){
        return resultCodes = message(0)
    }

    if (!resultCodes) {
        response.code = codes[6]
        response.message = message(0)
        response.accepted = message(1)
        return response
    }

    if (resultCodes.length > 0) {
        response.time = resultCodes[0].DATAHORA
        response.employee = values.FUNCIONARIO

        if (values.FUNCIONARIO !== resultCodes[0].USUARIO && resultCodes[0].CODAPONTA === 4) {
            response.employee = resultCodes[0].USUARIO
        }

        Object.entries(codes).forEach(element => {
            if(Number(element[0]) === resultCodes[0].CODAPONTA){
                response.code = element[1]
            }
        })


        acceptableStrings?.forEach(acc => {
            if (Number(resultCodes[0].CODAPONTA) === acc) {
                response.accepted = message(1)
            }
        })

        return response

    } else {
        response.accepted = message(33)
        return response
    }
}