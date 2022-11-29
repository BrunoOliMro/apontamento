import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { select } from "../services/select";
import { update } from "../services/update";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";
import { unravelBarcode } from "../utils/unravelBarcode";

export const returnedValue: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    const choosenOption = Number(sanitize(req.body["quantity"])) || 0;
    const supervisor = String(sanitize(req.body["supervisor"])) || null;
    const returnValues = String(sanitize(req.body['returnValueStorage'])) || null;
    const funcionario: string = decrypted(String(sanitize(req.cookies['employee']))) || null;
    const barcode = String(sanitize(req.body["codigoBarrasReturn"])) || null;
    const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
    let boas;
    let ruins;
    const codAponta = 8
    let descricaoCodigoAponta = ""
    let motivo = ``
    let tempoDecorrido = 0

    if (!funcionario) {
        return res.json({ message: 'odf não encontrada' })
    }

    if (!barcode && !choosenOption && !supervisor || supervisor=== "undefined") {
        return res.json({ message: "odf não encontrada" })
    }

    if (!barcode || barcode === 'undefined' || barcode === '') {
        return res.json({ message: "codigo de barras vazio" })
    }

    if (!supervisor || supervisor === "undefined" || supervisor === '') {
        return res.json({ message: "supervisor esta vazio" })
    }

    if (!choosenOption) {
        return res.json({ message: "quantidade esta vazio" })
    }
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

    const dados = await unravelBarcode(req.body.codigoBarras)
    const lookForOdfData = `SELECT TOP 1 [NUMERO_ODF], [NUMERO_OPERACAO], [CODIGO_MAQUINA], [CODIGO_CLIENTE], [QTDE_ODF], [CODIGO_PECA], [DT_INICIO_OP], [DT_FIM_OP], [QTDE_ODF], [QTDE_APONTADA], [DT_ENTREGA_ODF], [QTD_REFUGO], [HORA_INICIO], [HORA_FIM], [REVISAO] FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO WHERE 1 = 1 AND [NUMERO_ODF] = ${dados.numOdf} AND [CODIGO_MAQUINA] = '${dados.codMaq}' AND [NUMERO_OPERACAO] = ${dados.numOper} ORDER BY NUMERO_OPERACAO ASC`
    const resourceOdfData = await select(lookForOdfData)

    if (resourceOdfData.length > 0) {
       let codigoPeca = String(resourceOdfData[0].CODIGO_PECA)
        let revisao = String(resourceOdfData[0].REVISAO)
        let qtdOdf = Number(resourceOdfData[0].QTDE_ODF[0]) || 0
        let qtdApontOdf = Number(resourceOdfData[0].QTDE_APONTADA) || 0
        let faltante = Number(0)
        let retrabalhada = Number(0)
        let qtdLibMax = qtdOdf - qtdApontOdf

        if (resourceOdfData[0].QTDE_APONTADA <= 0) {
            qtdLibMax = 0
        }

        if (qtdLibMax <= 0) {
            return res.json({ message: "não ha valor que possa ser devolvido" })
        }

        if (boas > qtdLibMax) {
            const response = {
                qtdLibMax: qtdLibMax,
                String: 'valor devolvido maior que o permitido'
            }
            return res.json(response)
        }

        const selectSuper = Math.min(...await select(lookForSupervisor).then((result: any)=> result.rowsAffected))

        if (selectSuper > 0) {
            try {
                const insertHisCodReturned = await insertInto(funcionario, dados.numOdf, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido)
                const updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - '${boas}', QTD_REFUGO = QTD_REFUGO - ${ruins} WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' AND CODIGO_MAQUINA = '${dados.codMaq}'`
                const updateValuesOnPcp = await update(updateQuery)

                if (insertHisCodReturned.length > 0 && updateValuesOnPcp.length > 0) {
                    return res.status(200).json({ message: 'estorno feito' })
                } else if (insertHisCodReturned.length <= 0 || updateValuesOnPcp.length <= 0) {
                    return res.json({ message: 'erro de estorno' })
                }
            } catch (error) {
                console.log(error)
                return res.json({ message: 'erro de estorno' })
            } finally {
                await connection.close()
            }
            return res.json({ message: 'erro de estorno' })
        } else {
            return res.json({ message: 'erro de estorno' })
        }
    } else {
        return res.json({ message: 'erro de estorno' })
    }
}