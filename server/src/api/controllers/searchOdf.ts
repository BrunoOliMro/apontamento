import type { RequestHandler } from 'express';
import sanitize from 'sanitize-html';
import { select } from '../services/select';
import { selectToKnowIfHasP } from '../services/selectIfHasP';
import { decrypted } from '../utils/decryptedOdf';
import { encoded } from '../utils/encodedOdf';
import { encrypted } from '../utils/encryptOdf';
import { unravelBarcode } from '../utils/unravelBarcode'
import { odfIndex } from '../utils/odfIndex';
import { selectedItensFromOdf } from '../utils/queryGroup';

export const searchOdf: RequestHandler = async (req, res) => {
    const dados: any = unravelBarcode(req.body.barcode)
    //let message = String(req.body.message) || null
    let qtdLibMax: number = 0
    const lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`

    // if (message === 'codeApont 1 setup iniciado') {
    //     return res.json({ message: 'codeApont 1 setup iniciado' })
    // }

    // if (message === `codeApont 4 prod finalzado`) {
    //     return res.json({ message: 'codeApont 4 prod finalzado' })
    // }

    // if (message === `codeApont 5 maquina parada`) {
    //     return res.json({ message: 'codeApont 5 maquina parada' })
    // }

    // Seleciona todos os itens da Odf
    const groupOdf = await select(lookForOdfData)

    if (!groupOdf) {
        return res.json({ message: 'odf não encontrada' })
    }

    let indexOdf: number = await odfIndex(groupOdf, dados.numOper)

    if (!indexOdf) {
        return res.json({ message: 'Algo deu errado' })
    }

    const selectedItens: any = await selectedItensFromOdf(groupOdf, indexOdf)

    if (selectedItens.odf.QTDE_APONTADA - selectedItens.beforeOdf.QTDE_APONTADA === 0) {
        return res.status(400).json({ message: 'não há limite na odf' })
    }

    qtdLibMax = selectedItens.beforeOdf.QTDE_APONTADA - selectedItens.odf.QTDE_APONTADA

    // Caso seja a primeira Odf, objOdfSelecAnterior vai vir como undefined
    // if (!objOdfSelecAnterior) {
    //     let updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' AND CODIGO_MAQUINA = '${dados.codMaq}'`
    //     objOdfSelecAnterior = 0
    //     try {
    //         const apontLib = await update(updateQuery)
    //         console.log('linha 111 /searchOdf/', apontLib);
    //     } catch (err) {
    //         console.log("err linha 113", pointedFree);
    //     }
    // }
    let numeroOper = '00' + selectedItens.odf.NUMERO_OPERACAO.replaceAll(' ', '0')

    // Descriptografa o funcionario dos cookies
    let funcionario = decrypted(String(sanitize(req.cookies['employee'])))

    if (!funcionario) {
        return res.json({ message: 'Algo deu errado' })
    }

    //Criptografa os dados da ODF
    let qtdLibString: string = encrypted(String(qtdLibMax))
    let encryptedOdfNumber = encrypted(String(selectedItens.odf.NUMERO_ODF))
    const encryptedNextMachine = encrypted(String(selectedItens.nextOdf.CODIGO_MAQUINA))
    const encryptedNextOperation = encrypted(String(selectedItens.nextOdf.NUMERO_OPERACAO))
    const encryptedCodePart = encrypted(String(selectedItens.odf.CODIGO_PECA))
    const encryptedMachineCode = encrypted(String(selectedItens.odf.CODIGO_MAQUINA))
    const operationNumber = encrypted(String(numeroOper))
    const encryptedRevision = encrypted(String(selectedItens.odf.REVISAO))

    //Codifica os dados da ODF
    const encodedOdfNumber = encoded(String(selectedItens.odf.NUMERO_ODF))
    const encodedOperationNumber = encoded(String(numeroOper))
    const encodedMachineCode = encoded(String(selectedItens.odf.CODIGO_MAQUINA))

    res.cookie('NUMERO_ODF', encryptedOdfNumber);
    res.cookie('encodedOdfNumber', encodedOdfNumber)
    res.cookie('encodedOperationNumber', encodedOperationNumber)
    res.cookie('encodedMachineCode', encodedMachineCode)
    res.cookie('qtdLibMax', qtdLibString)
    res.cookie('MAQUINA_PROXIMA', encryptedNextMachine)
    res.cookie('OPERACAO_PROXIMA', encryptedNextOperation)
    res.cookie('CODIGO_PECA', encryptedCodePart)
    res.cookie('CODIGO_MAQUINA', encryptedMachineCode)
    res.cookie('NUMERO_OPERACAO', operationNumber)
    res.cookie('REVISAO', encryptedRevision)

    // if(message === 'codeApont 2 setup finalizado'){
    //     return res.json({message : 'codeApont 1 setup iniciado'})
    // }

    // if(message === `codeApont 3 prod iniciado`){
    //     return res.json({message : 'codeApont 3 prod iniciado'})
    // }

    let lookForChildComponents: any = await selectToKnowIfHasP(dados, qtdLibMax, funcionario, numeroOper, selectedItens.odf.CODIGO_PECA)

    if (lookForChildComponents!.reserved > qtdLibMax) {
        lookForChildComponents!.reserved = qtdLibMax
    }

    if (!lookForChildComponents || lookForChildComponents === 'Quantidade para reserva inválida') {
        return res.json({ message: 'Algo deu errado' })
    }

    if (lookForChildComponents.message === 'Algo deu errado') {
        return res.json({ message: 'Algo deu errado' })
    }

    if (lookForChildComponents.message === 'Valores Reservados') {
        res.cookie('reservedItens', lookForChildComponents!.reserved)
        res.cookie('codigoFilho', lookForChildComponents!.codigoFilho)
        res.cookie('condic', lookForChildComponents!.condic)
        res.cookie('quantidade', lookForChildComponents!.quantidade)
        return res.json({ message: 'Valores Reservados' })
    }

    if (lookForChildComponents.message === 'Quantidade para reserva inválida') {
        return res.json({ message: 'Quantidade para reserva inválida' })
    }

    if (lookForChildComponents.message === 'Não há item para reservar') {
        return res.json({ message: 'Não há item para reservar' })
    }
    else {
        return res.json({ message: 'Algo deu errado' })
    }
}
