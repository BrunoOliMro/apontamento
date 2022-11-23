import { RequestHandler } from "express";
import { pictures } from "../pictures";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { decodedBuffer } from "../utils/decodeOdf";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

//Ferramenta
export const tools: RequestHandler = async (req, res, next) => {

    if (req.cookies['NUMERO_ODF'] === undefined) {
        return res.json({ message: 'Algo deu errado' })
    }

    let decodedOdfNumber = decodedBuffer(String(sanitize(req.cookies['encodedOdfNumber']))) || null
    let numeroOdf = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let numeroOperacao: string = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    let codigoMaq: string = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
    let funcionario: string = decrypted(String(sanitize(req.cookies['employee']))) || null
    let revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    let start: number = decrypted(String(sanitize(req.cookies["startSetupTime"]))) || null
    let qtdLibMax: number = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null

    let startTime: number
    startTime = Number(start)
    let ferramenta: string = String("_ferr")

    const boas = 0
    const ruins = 0
    const codAponta = 1
    const descricaoCodigoAponta = 'Ini Setup.'
    const faltante = 0
    let retrabalhada = 0
    const motivo = ''
    let lookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${codigoPeca}'`

    if (numeroOdf !== decodedOdfNumber) {
        return res.json({ message: 'Erro na ODF' })
    }
    numeroOdf = Number(numeroOdf)
    qtdLibMax = Number(qtdLibMax)


    try {
        let toolsImg: any;
        try {
            toolsImg = await select(lookForTools)
            await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, startTime)
        } catch (error) {
            console.log(error);
            return res.json({ message: "Erro ao inserir codapontamento 1" })
        }

        if (toolsImg === 'Data not found') {
            return res.json({ message: 'Data not found' })
        }

        let result = [];
        for await (let [i, record] of toolsImg.entries()) {
            const rec = await record;
            const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }

        if (toolsImg.length <= 0) {
            return res.json({ message: "/images/sem_imagem.gif" });
        }

        if (toolsImg.length > 0) {
            console.log("linha 75 /codigo de apontamento 1 inserido ..../");
            res.cookie('tools', 'true')
            let obj = {
                message: 'codeApont 1 inserido',
                result: result,
            }
            return res.json(obj)
        } else {
            next()
        }

    } catch (error) {
        return res.json({ error: true, message: "Erro ao tentar acessar as fotos de ferramentas" });
    }
}

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    let numeroOdf: number = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
    numeroOdf = Number(numeroOdf)
    const numeroOperacao: string = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const codigoMaq: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    const funcionario: string = decrypted(String(sanitize(req.cookies['employee']))) || null
    const revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    let qtdLibMax: number = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null
    qtdLibMax = Number(qtdLibMax)
    let start: string = decrypted(String(sanitize(req.cookies['startSetupTime']))) || null
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
        const codApontamentoFinalSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, startProd)

        //INSERE EM CODAPONTA 3
        const codApontamentoInicioSetup = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, startProd)

        if (codApontamentoInicioSetup === 'Algo deu errado' || codApontamentoFinalSetup === 'Algo deu errado') {
            return res.json({ message: 'Algo deu errado' })
        }
        if (codApontamentoInicioSetup === 'insert done' && codApontamentoFinalSetup === 'insert done') {
            return res.json({ message: 'ferramentas selecionadas com successo' })
        } else {
            return res.json({ message: 'Algo deu errado' })
        }
    } catch (error) {
        console.log('linha 104 /selected Tools/: ', error)
        return res.json({ message: 'Algo deu errado' })
    }
}