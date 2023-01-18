import { inicializer } from "../services/variableInicializer";
import { verifyCodeNote } from "../services/verifyCodeNote";
import { insertInto } from "../services/insert";
import { message } from "../services/message";
import { RequestHandler } from "express";
import { pictures } from "../pictures";
import { selectQuery } from "../services/query";
// import { decodedBuffer } from "../utils/decodeOdf";
// if (odfNumber !== Number(decodedBuffer(String(sanitize(req.cookies['encodedOdfNumber'])))) || null) {
//     return res.json( message(0) })
// }

//Ferramenta
export const tools: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)
    const toolString = String("_ferr")
    const result = [];
    var toolsImg;
    variables.cookies.goodFeed = null
    variables.cookies.badFeed = null
    variables.cookies.pointedCode = [1]
    variables.cookies.missingFeed = null
    variables.cookies.reworkFeed = null
    variables.cookies.pointedCodeDescription = ['Ini Setup.']
    variables.cookies.motives = null
    variables.cookies.tempoDecorrido = null

    const codeNoteResult = await verifyCodeNote(variables.cookies, [6, 8, 9])

    console.log('result Code note --Tools.Ts-- ', codeNoteResult);

    if(codeNoteResult.code === message(38)){
        toolsImg = await selectQuery(20, variables.cookies)
            console.log('toolsImg', toolsImg);
            if (!toolsImg.data) {
                return res.json({ status: message(1), message: message(16), data: message(33) });
            } else if (toolsImg.data) {
                for await (const [i, record] of toolsImg.data.entries()) {
                    const rec = await record;
                    const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], toolString, String(i));
                    result.push(path);
                }
                return res.json({ status: message(1), message: message(1), data: result })
            } else {
                return res.json({ status: message(1), message: message(1), data: message(16) });
            }
    }

    if (codeNoteResult.accepted || codeNoteResult.code === message(17)) {
        console.log('InsertInto 1');
        const inserted = await insertInto(variables.cookies)
        if (inserted === message(1)) {
            toolsImg = await selectQuery(20, variables.cookies)
            console.log('toolsImg.data', toolsImg.data);
            if (!toolsImg.data) {
                return res.json({ status: message(1), message: message(16), data: message(33) });
            } else if (toolsImg.data) {
                for await (const [i, record] of toolsImg.data.entries()) {
                    const rec = await record;
                    const path = await pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], toolString, String(i));
                    result.push(path);
                }
                return res.json({ status: message(1), message: message(1), data: result })
            } else {
                return res.json({ status: message(1), message: message(1), data: message(16) });
            }
        } else {
            return res.json({ status: message(1), message: message(0), data: message(33) })
        }
    } else {
        return res.json({ status: message(1), message: message(45), data: message(33) })
    }
}

//Ferramentas Selecionadas
export const selectedTools: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)
    variables.cookies.goodFeed = null
    variables.cookies.badFeed = null
    variables.cookies.missingFeed = null
    variables.cookies.reworkFeed = null
    variables.cookies.motives = null

    const codeNoteResult = await verifyCodeNote(variables.cookies, [1])

    console.log('codeNoteResult select', codeNoteResult);

    const startSetupTime = new Date(codeNoteResult.time).getTime()
    const timeSpend = Number(new Date().getTime() - startSetupTime) || null
    variables.cookies.tempoDecorrido = timeSpend

    if (codeNoteResult.accepted) {
        console.log('insert into 2');
        //INSERE EM CODAPONTA 2
        variables.cookies.pointedCodeDescription = ['Fin Setup'];
        variables.cookies.pointedCode = [2];
        const codApontamentoFinalSetup = await insertInto(variables.cookies);
        if (codApontamentoFinalSetup !== message(0)) {
            console.log('insert into 3');
            //INSERE EM CODAPONTA 3
            variables.cookies.pointedCode = [3]
            const codApontamentoInicioSetup = await insertInto(variables.cookies)
            if (codApontamentoInicioSetup !== message(0)) {
                return res.json({ status: message(1), message: message(1), data: message(33) })
            } else {
                return res.json({ status: message(1), message: message(0), data: message(33) })
            }
        }
        else {
            return res.json({ status: message(1), message: message(0), data: codeNoteResult.code })
        }
    } else {
        const codeNoteResult = await verifyCodeNote(variables.cookies, [2])
        console.log('codeNoteResult segundooooo', codeNoteResult);

        if (codeNoteResult.accepted) {
            console.log('insert into 3');
            //INSERE EM CODAPONTA 3
            variables.cookies.pointedCodeDescription = ['Ini Prod.']
            variables.cookies.pointedCode = [3]
            const codApontamentoInicioSetup = await insertInto(variables.cookies)
            if (codApontamentoInicioSetup) {
                return res.json({ status: message(1), message: message(1), data: message(33) })
            } else {
                return res.json({ status: message(1), message: message(0), data: message(33) })
            }
        } else {
            return res.json({ status: message(1), message: message(0), data: codeNoteResult.code })
        }
    }
}