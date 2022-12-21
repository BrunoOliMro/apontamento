import { RequestHandler } from 'express';
import { select } from '../services/select';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
//import { encrypted } from '../utils/encryptOdf';
import { odfIndex } from '../utils/odfIndex';
import { sanitize } from '../utils/sanitize';
//import { selectedItensFromOdf } from '../utils/queryGroup';

export const odfData: RequestHandler = async (req, res) => {
    const response: any = {
        message: '',
        resEmployee: '',
        odfSelecionada: '',
    }
    try {
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var operationNumber = String(decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO'])))) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var stringLookOdfData = `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
    } catch (error) {
        console.log('error on cookies', error);
        return res.json({ message: 'Algo deu errado' })
    }
    try {
        const pointedCode = await codeNote(odfNumber, Number(operationNumber), machineCode, employee)
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const data = await select(stringLookOdfData)
            const i = await odfIndex(data, '00' + operationNumber!.replaceAll(' ', '0') || null)
            response.odfSelecionada = data[i]
            response.resEmployee = employee

            if (response.message === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' });
            } else {
                response.message = 'Success'
                return res.status(200).json(response);
            }
        } else {
            return res.json({ message: pointedCode })
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: 'Algo deu errado' });
    }
}