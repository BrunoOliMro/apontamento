import { select } from "../services/select"

export const codeNote = async (odfNumber: number, operationNumber: number, codeMachine: string) => {
    const lookForHisaponta = `SELECT TOP 1 CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${odfNumber} AND NUMOPE = ${operationNumber} AND ITEM = '${codeMachine}' ORDER BY DATAHORA DESC`
    let codigoDeApontamento;
    var response = {
        message: '',
    }
    codigoDeApontamento = await select(lookForHisaponta)
    if (codigoDeApontamento.length > 0) {
        if (codigoDeApontamento[0].hasOwnProperty('CODAPONTA')) {
            if (codigoDeApontamento[0].CODAPONTA === 1) {
                return response.message = 'Pointed Iniciated'
            } else if (codigoDeApontamento[0].CODAPONTA === 2) {
                return response.message = 'Fin Setup'
            } else if (codigoDeApontamento[0].CODAPONTA === 3) {
                return response.message = 'Ini Prod'
            } else if (codigoDeApontamento[0].CODAPONTA === 4) {
                return response.message = 'Pointed'
            } else if (codigoDeApontamento[0].CODAPONTA === 5) {
                return response.message = 'Rip iniciated'
            } else if (codigoDeApontamento[0].CODAPONTA === 6) {
                return response.message = 'Begin new process'
            } else if (codigoDeApontamento[0].CODAPONTA === 7) {
                return response.message = 'Machine has stopped'
            } else if (codigoDeApontamento[0].CODAPONTA === 8) {
                return response.message = 'A value was returned'
            } else {
                return response.message = 'Something went wrong'
            }
        } else if (codigoDeApontamento.length <= 0) {
            return response.message = 'First time acessing ODF'
        } else {
            return response.message = 'Something went wrong'
        }
    } else if (codigoDeApontamento.length <= 0) {
        return response.message = 'Begin new process'
    } else {
        return response.message = 'Something went wrong'
    }
}