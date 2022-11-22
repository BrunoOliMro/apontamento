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
        console.log("algo deu errado linha 17 /tools/");
        return res.json({ message: 'Algo deu errado' })
    }

    let decodedOdfNumber = decodedBuffer(String(sanitize(req.cookies['encodedOdfNumber']))) || null
    let numeroOdf = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
    let numeroOperacao: string = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
    let codigoMaq: string = decrypted(String(sanitize(req.cookies["CODIGO_MAQUINA"]))) || null
    let funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    let revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    let start: number = decrypted(String(sanitize(req.cookies["starterBarcode"]))) || null
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

    console.log("linha 41", decodedOdfNumber);

    if(numeroOdf !== decodedOdfNumber) {
        return res.json({message : 'Erro na ODF'})
    }
    numeroOdf = Number(numeroOdf)
    qtdLibMax = Number(qtdLibMax)


    try {
        let toolsImg: any;
        try {
            console.log("linha 55 /tools/");
            toolsImg = await select(lookForTools)
            await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, startTime)
            console.log("linha 58 /tools/");
        } catch (error) {
            console.log(error);
            return res.json({ message: "Erro ao inserir codapontamento 1" })
        }

        if(toolsImg === 'Data not found'){
            return res.json({message : 'Data not found'})
        }
        
        console.log("linha 53 /tools/", toolsImg);

        let result = [];
        for await (let [i, record] of toolsImg.entries()) {
            console.log("linha 57 /tools/ ");
            const rec = await record;
            const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }
        console.log("linha 61 /tools/");

        if (toolsImg.length <= 0) {
            return res.json({ message: "/images/sem_imagem.gif" });
        }

        if (toolsImg.length > 0) {
            res.cookie('tools', 'true')
            return res.json(result)
        } else {
            next()
        }

    } catch (error) {
        return res.json({ error: true, message: "Erro ao tentar acessar as fotos de ferramentas" });
    } finally {
        // await connection.close()
    }
}

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
        console.log("linha 143 /selected tools/");
        //INSERE EM CODAPONTA 2
        insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, startProd)

        //INSERE EM CODAPONTA 3
        insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, startProd)
        
        console.log("linha 149 /selected tools/");

        return res.json({ message: 'ferramentas selecionadas com successo' })
    } catch (error) {
        console.log('linha 104 /selected Tools/: ', error)
        return res.redirect("/#/ferramenta")
    } finally {
        // await connection.close()
    }
}