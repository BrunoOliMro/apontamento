import { select } from "../services/select"

export const codeNote = async (odfNumber: number | null, operationNumber: number | null, codeMachine: string | null, funcionario: string) => {
    const lookForHisaponta = `SELECT TOP 1 CODAPONTA, USUARIO  FROM HISAPONTA WHERE 1 = 1 AND ODF = ${odfNumber} AND NUMOPE = ${operationNumber} AND ITEM = '${codeMachine}' ORDER BY DATAHORA DESC`
    let codigoDeApontamento;
    var response = {
        funcionario: '',
        message: '',
    }
    codigoDeApontamento = await select(lookForHisaponta)

    if (codigoDeApontamento.length > 0) {
        if (funcionario !== codigoDeApontamento[0].USUARIO && codigoDeApontamento[0].CODAPONTA === 4) {
            response.message = 'Usuario diferente'
            response.funcionario = codigoDeApontamento[0].USUARIO
        }
    }

    // console.log('linha 10 /CodigoDeApontamento/', codigoDeApontamento);
    if (codigoDeApontamento.length > 0) {
        if (codigoDeApontamento[0].hasOwnProperty('CODAPONTA')) {
            if (codigoDeApontamento[0].CODAPONTA === 1) {
                response.message = 'Pointed Iniciated'
                return response
            } else if (codigoDeApontamento[0].CODAPONTA === 2) {
                response.message = 'Fin Setup'
                return response
            } else if (codigoDeApontamento[0].CODAPONTA === 3) {
                response.message = 'Ini Prod'
                return response
            } else if (codigoDeApontamento[0].CODAPONTA === 4) {
                response.message = 'Pointed'
                return response
            } else if (codigoDeApontamento[0].CODAPONTA === 5) {
                response.message = 'Rip iniciated'
                return response
            } else if (codigoDeApontamento[0].CODAPONTA === 6) {
                response.message = 'Begin new process'
                return response
            } else if (codigoDeApontamento[0].CODAPONTA === 7) {
                response.message = 'Machine has stopped'
                return response
            } else if (codigoDeApontamento[0].CODAPONTA === 8) {
                response.message = 'A value was returned'
                return response
            } else {
                response.message = 'Something went wrong'
                return response
            }
        } else if (codigoDeApontamento.length <= 0) {
            response.message = 'First time acessing ODF'
            return response
        } else {
            response.message = 'Something went wrong'
            return response
        }
    } else if (codigoDeApontamento.length <= 0) {
        response.message = 'Begin new process'
        return response
    } else {
        response.message = 'Something went wrong'
        return response
    }
}