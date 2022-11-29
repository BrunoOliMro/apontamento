import { RequestHandler } from "express"
import sanitize from "sanitize-html"
import { insertInto } from "../services/insert"
import { decrypted } from "../utils/decryptedOdf"
import { encrypted } from "../utils/encryptOdf"

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    const numeroOdf: number = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || 0
    const numeroOperacao: string = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const codigoMaq: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['employee']))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    const qtdLibMax: number = Number(decrypted(String(sanitize(req.cookies['qtdLibMax'])))) || 0
    const boas = 0
    const ruins = 0
    const codAponta = 2
    const codAponta3 = 3
    const descricaoCodigoAponta = 'Fin Setup.'
    const descricaoCodigoAponta3 = 'Ini Prod.'
    const faltante = 0
    const retrabalhada = 0
    const motivo = String('' || null)

    //Encerra o primeiro tempo de setup
    const tempoDecorrido = Number(Number(new Date().getTime()) || 0 - Number(Number(new Date().getTime()) || 0 - Number(decrypted(String(sanitize(req.cookies['startSetupTime']))))) || 0)

    //Inicia a produção
    res.cookie("startProd", encrypted(Number(new Date().getTime() || 0)))

    try {
        //INSERE EM CODAPONTA 2
        const codApontamentoFinalSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido)
        if (codApontamentoFinalSetup === 'Algo deu errado') {
            return res.json({ message: 'Algo deu errado' })
        }
    } catch (error) {
        return res.json({ message: 'Algo deu errado' })
    }

    try {
        //INSERE EM CODAPONTA 3
        const codApontamentoInicioSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || 0))
        if (codApontamentoInicioSetup === 'Algo deu errado') {
            return res.json({ message: 'Algo deu errado' })
        } else if (codApontamentoInicioSetup === 'insert done') {
            return res.json({ message: 'ferramentas selecionadas com successo' })
        } else {
            return res.json({ message: 'Algo deu errado' })
        }
    } catch (error) {
        return res.json({ message: 'Algo deu errado' })
    }
}