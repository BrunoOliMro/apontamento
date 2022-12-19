import { RequestHandler } from "express";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { update } from "../services/update";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { odfIndex } from "../utils/odfIndex";
import { selectedItensFromOdf } from "../utils/queryGroup";
import { sanitize } from "../utils/sanitize";
import { unravelBarcode } from "../utils/unravelBarcode";

export const returnedValue: RequestHandler = async (req, res) => {
    try {
        var choosenOption = Number(sanitize(req.body["quantity"])) || null;
        var supervisor = sanitize(req.body["supervisor"]) || null;
        var returnValues = String(sanitize(req.body['returnValueStorage'])) || null;
        if (!returnValues) {
            return res.json({ message: 'Não foi indicado boas e ruins' })
        }
        var funcionario: string = decrypted(String(sanitize(req.cookies['CRACHA']))) || null;
        var data = unravelBarcode(sanitize(req.body["barcodeReturn"])) || null;
        var lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${data.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
        var boas = null;
        var ruins = null;
        var codAponta = [8]
        var descricaoCodigoAponta = null
        var motivo = null
        var tempoDecorrido = null
    } catch (error) {
        console.log('Error on returning values --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    var response = {
        message: '',
    }
    // if (!funcionario) {
    //     return res.json({ message: 'Funcionário inválido' })
    // }

    // if (!data && !choosenOption && !supervisor) {
    //     return res.json({ message: "ODF não encontrada" })
    // }

    // if (!data) {
    //     return res.json({ message: "Código de barras vazio" })
    // }

    // if (!supervisor) {
    //     return res.json({ message: 'Crachá de supervisor inválido' })
    // }

    // if (!choosenOption) {
    //     return res.json({ message: "Categoria de peças não foi apontado" })
    // }
    if (returnValues === 'BOAS') {
        boas = choosenOption
    }

    if (returnValues === 'RUINS') {
        ruins = choosenOption
    }

    if (!boas) {
        boas = 0
    }

    if (!ruins) {
        ruins = 0
    }

    const codeNoteResult = await codeNote(data.numOdf, data.numOper, data.codMaq, funcionario)
    console.log('linha 68 /return/', codeNoteResult);
    if (codeNoteResult.message !== 'Begin new process') {
        return res.json({ message: 'Not possible to return' })
    }

    let valorTotal = boas + ruins
    const groupOdf = await select(lookForOdfData)
    let indexOdf: number = await odfIndex(groupOdf, data.numOper)
    const selectedItens: any = await selectedItensFromOdf(groupOdf, indexOdf)
    console.log('LINHA 69', selectedItens.odf);
    if (!selectedItens.odf) {
        response.message = 'Invalid ODF'
    } else if (selectedItens.odf.QTDE_APONTADA <= 0 || selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTDE_ODF === 0) {
        return res.json({ message: "No limit" })
    } else if ("00" + selectedItens.odf.NUMERO_OPERACAO.replaceAll(' ', '0') !== data.numOper) {
        response.message = 'Invalid ODF'
        return res.json(response)
    } else if (!selectedItens.odf.QTD_REFUGO && ruins > 0) {
        console.log('linha 79');
        response.message = 'Bad feed invalid'
        return res.json(response)
    } else if (selectedItens.odf.QTDE_APONTADA < valorTotal) {
        console.log('linha 84');
        response.message = 'No limit'
        return res.json(response)
    } else {
        let codigoPeca = String(selectedItens.odf.CODIGO_PECA)
        let revisao = String(selectedItens.odf.REVISAO)
        let qtdLib = selectedItens.odf.QTDE_LIB - valorTotal
        let faltante = selectedItens.odf.QTD_FALTANTE - valorTotal
        let retrabalhada = null
        let qtdLibMax = selectedItens.odf.QTDE_APONTADA - selectedItens.odf.QTDE_ODF

        const selectSuper: any = await select(lookForSupervisor)
        if (selectSuper.length > 0) {
            try {
                const insertHisCodReturned = await insertInto(funcionario, data.numOdf, codigoPeca, revisao, data.numOper, data.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido)
                if (insertHisCodReturned) {
                    const updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - ${boas}, QTD_FALTANTE = QTD_FALTANTE - ${faltante}, QTDE_LIB = ${qtdLib} ,QTD_REFUGO = QTD_REFUGO - ${ruins} WHERE 1 = 1 AND NUMERO_ODF = '${data.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${data.numOper}' AND CODIGO_MAQUINA = '${data.codMaq}'`
                    const updateValuesOnPcp = await update(updateQuery)
                    if (updateValuesOnPcp === 'Sucess') {
                        return res.status(200).json({ message: 'Returned values done' })
                    } else {
                        return res.json({ message: 'Return error' })
                    }
                } else {
                    return res.json({ message: 'Return error' })
                }
            } catch (error) {
                console.log(error)
                return res.json({ message: 'Return error' })
            }
        } else {
            return res.json({ message: 'Return error' })
        }
    }
}