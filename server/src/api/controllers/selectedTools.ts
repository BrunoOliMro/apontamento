import { RequestHandler } from "express"
import sanitize from "sanitize-html"
import { insertInto } from "../services/insert"
import { decrypted } from "../utils/decryptedOdf"
import { encrypted } from "../utils/encryptOdf"

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    let numeroOdf: number = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
    numeroOdf = Number(numeroOdf)
    const numeroOperacao: string = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const codigoMaq: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    let qtdLibMax: number = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null
    qtdLibMax = Number(qtdLibMax)
    let start: string = decrypted(String(sanitize(req.cookies['starterBarcode']))) || null
    const boas = 0
    const ruins = 0
    const codAponta = 2
    const codAponta3 = 3
    const descricaoCodigoAponta = 'Fin Setup.'
    let descricaoCodigoAponta3 = 'Ini Prod.'
    const faltante = 0
    let retrabalhada = 0
    const motivo = String('' || null)

    //Encerra o primeiro tempo de setup
    const end = Number(new Date().getTime()) || 0;
    let startTime: number
    startTime = Number(start)
    let tempoDecorrido = String(end - startTime || 0)
    String(tempoDecorrido)

    //Inicia a produção
    let startProd = Number(new Date().getTime() || 0)
    start = encrypted(start)
    res.cookie("startProd", startProd)

    try {
        //INSERE EM CODAPONTA 2
        insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, startProd)

        //INSERE EM CODAPONTA 3
        insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, startProd)

        return res.json({ message: 'ferramentas selecionadas com successo' })
    } catch (error) {
        console.log('linha 104 /selected Tools/: ', error)
        return res.redirect("/#/ferramenta")
    } finally {
        // await connection.close()
    }
}