import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
//import { cookieGenerator } from "../utils/cookieGenerator";
//import { cookieGenerator } from "../utils/cookieGenerator";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
//import { encrypted } from "../utils/encryptOdf";

export const rip: RequestHandler = async (req, res) => {
    try {
        var numpec: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
        var revisao: string = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
        var codeMachine: string = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var codigoPeca: string = decrypted(String(sanitize(req.cookies["CODIGO_PECA"]))) || null
        var odfNumber: number = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
        var operationNumber = decrypted(String(sanitize(req.cookies["NUMERO_OPERACAO"]))) || null
        var funcionario: string = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        var start: string = decrypted(String(sanitize(req.cookies["startSetupTime"]))) || null
        var qtdLibMax: number = decrypted(String(sanitize(req.cookies['QTDE_LIB']))) || null
        res.cookie('startRip', encrypted(String(new Date().getDate())));
        var descricaoCodAponta = `Rip Ini`
        var boas = null
        var ruins = null
        var faltante = null
        var retrabalhada = null
        var codAponta = [5]
        var motivo = null
        var startTime: number = Number(new Date(start).getTime()) || 0
        var response = {
            message: '',
            url: '',
            object: '',
        }
        var rip = `
            SELECT  DISTINCT
            PROCESSO.NUMPEC,
            PROCESSO.REVISAO,
            QA_CARACTERISTICA.NUMCAR AS NUMCAR,
            QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE,
            QA_CARACTERISTICA.DESCRICAO,
            ESPECIFICACAO  AS ESPECIF,
            LIE,
            LSE,
            QA_CARACTERISTICA.INSTRUMENTO
            FROM PROCESSO
            INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO
            INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC
            AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA 
            AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO 
            LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA  
            FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE
            WHERE PROCESSO.NUMPEC = '${numpec}' 
            AND PROCESSO.REVISAO = '${revisao}' 
            AND CST_NUMOPE = '${codeMachine}'
            AND NUMCAR < '2999'
            ORDER BY NUMPEC ASC`
    } catch (error) {
        console.log('Error on Rip --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }

    // Select to see if there any children
    try {
        var ripDetails = await select(rip)
    } catch (error) {
        console.log('Error on Rip Select', error);
        return res.json({ message: 'Algo deu errado' })
    }

    // If there are no response from select
    if (ripDetails.length <= 0) {
        console.log('inseringo codigo 5...');
        response.message = 'Não há rip a mostrar'
        response.url = '/#/codigobarras'
        const x = await insertInto(funcionario, odfNumber, codigoPeca, revisao, operationNumber, codeMachine, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, startTime)
        if (x) {
            console.log('linha 60 /rip.svelte/');
            return res.json(response)
        } else {
            return res.json({ message: 'Algo deu errado' })
        }
    }

    // In case there is response from select
    let arrayNumope = ripDetails.map((acc: { CST_NUMOPE: string; }) => {
        if (acc.CST_NUMOPE === codeMachine) {
            return acc
        } else {
            return acc
        }
    })

    // Set cookies to point later
    let numopeFilter = arrayNumope.filter((acc: any) => acc)
    res.cookie('cstNumope', numopeFilter.map((acc: { CST_NUMOPE: string; }) => acc.CST_NUMOPE))
    res.cookie('numCar', numopeFilter.map((acc: { NUMCAR: any; }) => acc.NUMCAR))
    res.cookie('descricao', numopeFilter.map((acc: { DESCRICAO: any; }) => acc.DESCRICAO))
    res.cookie('especif', numopeFilter.map((acc: { ESPECIF: any; }) => acc.ESPECIF))
    res.cookie('instrumento', numopeFilter.map((acc: { INSTRUMENTO: any; }) => acc.INSTRUMENTO))
    res.cookie('lie', numopeFilter.map((acc: { LIE: any; }) => acc.LIE))
    res.cookie('lse', numopeFilter.map((acc: { LSE: any; }) => acc.LSE))

    try {
        // Codigo de apontamento on last point
        const pointedCode = await codeNote(odfNumber, operationNumber, codeMachine, funcionario)
        if (pointedCode.message === 'Pointed') {
            try {
                const inserted = await insertInto(funcionario, odfNumber, codigoPeca, revisao, operationNumber, codeMachine, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, startTime)
                if (inserted) {
                    return res.json(numopeFilter)
                } else {
                    return response.message = 'Algo deu errado'
                }
            } catch (error) {
                console.log('linha 98 /eror/', error);
                return response.message = 'Algo deu errado'
            }
        } else if (pointedCode.message === 'Rip iniciated') {
            return res.json(numopeFilter)
        } else {
            return res.json({ message: pointedCode.message })
        }
    } catch (error) {
        response.url = '/#/codigobarras/'
        response.message = 'Erro ao iniciar tempo da rip'
        return res.json(response)
    }
}