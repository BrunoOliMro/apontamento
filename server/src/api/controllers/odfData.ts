import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { odfIndex } from '../utils/odfIndex';
import { RequestHandler } from 'express';

export const odfData: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)
    const response: any = {
        odfSelecionada: '',
    }

    if (!variables) {
        return res.json({ status: message(1), message: message(0), data: message(33), code: message(33) });
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [3, 4, 5, 7])

    if (resultVerifyCodeNote.accepted) {

        const resultQuery = await selectQuery(24, variables.cookies);
        if (!resultQuery) {
            return res.json({ status: message(1), message: message(0), data: message(0), code: resultVerifyCodeNote.code })
        }

        const i = await odfIndex(resultQuery.data, '00' + variables.cookies.NUMERO_OPERACAO.replaceAll(' ', '0'));
        if (i === null || i === undefined) {
            return res.json({ status: message(1), message: message(0), data: message(0), code: resultVerifyCodeNote.code })
        }

        response.odfSelecionada = resultQuery.data![i];
        response.odfSelecionada.FUNCIONARIO = variables.cookies.FUNCIONARIO;
        return res.json({ status: message(1), message: message(1), data: response.odfSelecionada, code: resultVerifyCodeNote.code })
    } else {
        return res.json({ status: message(1), message: message(0), data: message(33), code: resultVerifyCodeNote.code });
    }
}