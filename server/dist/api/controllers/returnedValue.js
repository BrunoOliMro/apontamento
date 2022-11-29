"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnedValue = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const update_1 = require("../services/update");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const returnedValue = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const choosenOption = Number((0, sanitize_1.sanitize)(req.body["quantity"])) || 0;
    const supervisor = String((0, sanitize_1.sanitize)(req.body["supervisor"])) || null;
    const returnValues = String((0, sanitize_1.sanitize)(req.body['returnValueStorage'])) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['employee']))) || null;
    const barcode = String((0, sanitize_1.sanitize)(req.body["codigoBarrasReturn"])) || null;
    const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
    let boas;
    let ruins;
    const codAponta = 8;
    let descricaoCodigoAponta = "";
    let motivo = ``;
    let tempoDecorrido = 0;
    if (!funcionario) {
        return res.json({ message: 'odf não encontrada' });
    }
    if (!barcode && !choosenOption && !supervisor || supervisor === "undefined") {
        return res.json({ message: "odf não encontrada" });
    }
    if (!barcode || barcode === 'undefined' || barcode === '') {
        return res.json({ message: "codigo de barras vazio" });
    }
    if (!supervisor || supervisor === "undefined" || supervisor === '') {
        return res.json({ message: "supervisor esta vazio" });
    }
    if (!choosenOption) {
        return res.json({ message: "quantidade esta vazio" });
    }
    if (returnValues === 'BOAS') {
        boas = choosenOption;
    }
    if (returnValues === 'RUINS') {
        ruins = choosenOption;
    }
    if (!boas) {
        boas = 0;
    }
    if (!ruins) {
        ruins = 0;
    }
    const dados = await (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    const lookForOdfData = `SELECT TOP 1 [NUMERO_ODF], [NUMERO_OPERACAO], [CODIGO_MAQUINA], [CODIGO_CLIENTE], [QTDE_ODF], [CODIGO_PECA], [DT_INICIO_OP], [DT_FIM_OP], [QTDE_ODF], [QTDE_APONTADA], [DT_ENTREGA_ODF], [QTD_REFUGO], [HORA_INICIO], [HORA_FIM], [REVISAO] FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO WHERE 1 = 1 AND [NUMERO_ODF] = ${dados.numOdf} AND [CODIGO_MAQUINA] = '${dados.codMaq}' AND [NUMERO_OPERACAO] = ${dados.numOper} ORDER BY NUMERO_OPERACAO ASC`;
    const resourceOdfData = await (0, select_1.select)(lookForOdfData);
    if (resourceOdfData.length > 0) {
        let codigoPeca = String(resourceOdfData[0].CODIGO_PECA);
        let revisao = String(resourceOdfData[0].REVISAO);
        let qtdOdf = Number(resourceOdfData[0].QTDE_ODF[0]) || 0;
        let qtdApontOdf = Number(resourceOdfData[0].QTDE_APONTADA) || 0;
        let faltante = Number(0);
        let retrabalhada = Number(0);
        let qtdLibMax = qtdOdf - qtdApontOdf;
        if (resourceOdfData[0].QTDE_APONTADA <= 0) {
            qtdLibMax = 0;
        }
        if (qtdLibMax <= 0) {
            return res.json({ message: "não ha valor que possa ser devolvido" });
        }
        if (boas > qtdLibMax) {
            const response = {
                qtdLibMax: qtdLibMax,
                String: 'valor devolvido maior que o permitido'
            };
            return res.json(response);
        }
        const selectSuper = Math.min(...await (0, select_1.select)(lookForSupervisor).then((result) => result.rowsAffected));
        if (selectSuper > 0) {
            try {
                const insertHisCodReturned = await (0, insert_1.insertInto)(funcionario, dados.numOdf, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido);
                const updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - '${boas}', QTD_REFUGO = QTD_REFUGO - ${ruins} WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' AND CODIGO_MAQUINA = '${dados.codMaq}'`;
                const updateValuesOnPcp = await (0, update_1.update)(updateQuery);
                if (insertHisCodReturned.length > 0 && updateValuesOnPcp.length > 0) {
                    return res.status(200).json({ message: 'estorno feito' });
                }
                else if (insertHisCodReturned.length <= 0 || updateValuesOnPcp.length <= 0) {
                    return res.json({ message: 'erro de estorno' });
                }
            }
            catch (error) {
                console.log(error);
                return res.json({ message: 'erro de estorno' });
            }
            finally {
                await connection.close();
            }
            return res.json({ message: 'erro de estorno' });
        }
        else {
            return res.json({ message: 'erro de estorno' });
        }
    }
    else {
        return res.json({ message: 'erro de estorno' });
    }
};
exports.returnedValue = returnedValue;
//# sourceMappingURL=returnedValue.js.map