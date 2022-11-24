"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOdf = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const select_1 = require("../services/select");
const selectIfHasP_1 = require("../services/selectIfHasP");
const update_1 = require("../services/update");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encodedOdf_1 = require("../utils/encodedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const searchOdf = async (req, res) => {
    const dados = (0, unravelBarcode_1.unravelBarcode)(req.body.barcode);
    let message = String(req.body.message) || null;
    let qtdLib = 0;
    let apontLib = '';
    let qntdeJaApontada = 0;
    let qtdLibMax = 0;
    let codigoMaquinaProxOdf;
    let codMaqProxOdf;
    if (message === 'codeApont 1 setup iniciado') {
        return res.json({ message: 'codeApont 1 setup iniciado' });
    }
    if (message === `codeApont 4 prod finalzado`) {
        return res.json({ message: 'codeApont 4 prod finalzado' });
    }
    if (message === `codeApont 5 maquina parada`) {
        return res.json({ message: 'codeApont 5 maquina parada' });
    }
    const lookForOdfData = `SELECT * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    const queryGrupoOdf = await (0, select_1.select)(lookForOdfData);
    if (queryGrupoOdf.message === 'odf não encontrada') {
        return res.json({ message: 'odf não encontrada' });
    }
    let codigoOperArray = queryGrupoOdf.map((e) => e.NUMERO_OPERACAO);
    let arrayAfterMap = codigoOperArray.map((e) => '00' + e).toString().replaceAll(' ', '0').split(',');
    let indiceDoArrayDeOdfs = arrayAfterMap.findIndex((callback) => callback === dados.numOper);
    if (indiceDoArrayDeOdfs <= 0) {
        indiceDoArrayDeOdfs = 0;
    }
    let objOdfSelecionada = queryGrupoOdf[indiceDoArrayDeOdfs];
    let objOdfSelecProximo = queryGrupoOdf[indiceDoArrayDeOdfs + 1];
    let objOdfSelecAnterior = queryGrupoOdf[indiceDoArrayDeOdfs - 1];
    if (indiceDoArrayDeOdfs === 0) {
        codigoMaquinaProxOdf = objOdfSelecProximo['CODIGO_MAQUINA'];
        codMaqProxOdf = objOdfSelecProximo['NUMERO_OPERACAO'];
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA'];
        qtdLib = objOdfSelecionada['QTDE_ODF'];
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO'];
    }
    if (indiceDoArrayDeOdfs === codigoOperArray.length - 1) {
        codigoMaquinaProxOdf = objOdfSelecionada['CODIGO_MAQUINA'];
        codMaqProxOdf = objOdfSelecionada['NUMERO_OPERACAO'];
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA'];
        qtdLib = objOdfSelecAnterior['QTDE_APONTADA'];
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO'];
    }
    if (indiceDoArrayDeOdfs > 0 && indiceDoArrayDeOdfs < codigoOperArray.length - 1) {
        codigoMaquinaProxOdf = objOdfSelecProximo['CODIGO_MAQUINA'];
        codMaqProxOdf = objOdfSelecProximo['NUMERO_OPERACAO'];
        qntdeJaApontada = objOdfSelecionada['QTDE_APONTADA'];
        qtdLib = objOdfSelecAnterior['QTDE_APONTADA'];
        apontLib = objOdfSelecionada['APONTAMENTO_LIBERADO'];
    }
    if (qtdLib - qntdeJaApontada === 0) {
        return res.status(400).json({ message: 'não há limite na odf' });
    }
    qtdLibMax = qtdLib - qntdeJaApontada;
    if (objOdfSelecAnterior === undefined) {
        let updateQuery = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' AND CODIGO_MAQUINA = '${dados.codMaq}'`;
        try {
            const apontLib = await (0, update_1.update)(updateQuery);
            console.log('linha 98 /searchOdf/', apontLib);
        }
        catch (err) {
            console.log("err linha 100", apontLib);
        }
    }
    if (objOdfSelecAnterior === undefined) {
        objOdfSelecAnterior = 0;
    }
    let numeroOper = '00' + objOdfSelecionada.NUMERO_OPERACAO.replaceAll(' ', '0');
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['employee'])));
    if (!funcionario) {
        return res.json({ message: 'Algo deu errado' });
    }
    let qtdLibString = (0, encryptOdf_1.encrypted)(String(qtdLibMax));
    console.log("linha 121 quantidade liberada /searchOdf/", qtdLibMax);
    let encryptedOdfNumber = (0, encryptOdf_1.encrypted)(String(objOdfSelecionada['NUMERO_ODF']));
    const encryptedNextMachine = (0, encryptOdf_1.encrypted)(String(codigoMaquinaProxOdf));
    const encryptedNextOperation = (0, encryptOdf_1.encrypted)(String(codMaqProxOdf));
    const encryptedCodePart = (0, encryptOdf_1.encrypted)(String(objOdfSelecionada['CODIGO_PECA']));
    const encryptedMachineCode = (0, encryptOdf_1.encrypted)(String(objOdfSelecionada['CODIGO_MAQUINA']));
    const operationNumber = (0, encryptOdf_1.encrypted)(String(numeroOper));
    const encryptedRevision = (0, encryptOdf_1.encrypted)(String(objOdfSelecionada['REVISAO']));
    const encodedOdfNumber = (0, encodedOdf_1.encoded)(String(objOdfSelecionada['NUMERO_ODF']));
    const encodedOperationNumber = (0, encodedOdf_1.encoded)(String(numeroOper));
    const encodedMachineCode = (0, encodedOdf_1.encoded)(String(objOdfSelecionada['CODIGO_MAQUINA']));
    res.cookie('NUMERO_ODF', encryptedOdfNumber);
    res.cookie('encodedOdfNumber', encodedOdfNumber);
    res.cookie('encodedOperationNumber', encodedOperationNumber);
    res.cookie('encodedMachineCode', encodedMachineCode);
    res.cookie('qtdLibMax', qtdLibString);
    res.cookie('MAQUINA_PROXIMA', encryptedNextMachine);
    res.cookie('OPERACAO_PROXIMA', encryptedNextOperation);
    res.cookie('CODIGO_PECA', encryptedCodePart);
    res.cookie('CODIGO_MAQUINA', encryptedMachineCode);
    res.cookie('NUMERO_OPERACAO', operationNumber);
    res.cookie('REVISAO', encryptedRevision);
    let lookForChildComponents = await (0, selectIfHasP_1.selectToKnowIfHasP)(dados, qtdLibMax);
    if (lookForChildComponents.message === 'Rodar insert') {
        const insertAlocaoQuery = [];
        let insertAlocacao;
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        try {
            if (lookForChildComponents.reserved) {
                lookForChildComponents.reserved.forEach((qtdItem, i) => {
                    insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES ('${dados.numOdf}', 40, '105831437', '${lookForChildComponents.codigoFilho[i]}', ${qtdItem}, 'WEUHGV', NULL, GETDATE(), 'CESAR')`);
                });
                insertAlocacao = await connection.query(insertAlocaoQuery.join('\n')).then(result => result.rowsAffected);
                let min = Math.min(...insertAlocacao);
                console.log("linha 172", min);
                if (min <= 0) {
                    return res.json({ message: 'Algo deu errado' });
                }
                else {
                    res.cookie('reservedItens', lookForChildComponents.reserved);
                    res.cookie('codigoFilho', lookForChildComponents.codigoFilho);
                    res.cookie('condic', lookForChildComponents.condic);
                    return res.json({ message: 'Valores Reservados' });
                }
            }
        }
        catch (error) {
            console.log("linha 181 /selectHasP/", error);
            return res.json({ message: 'Algo deu errado' });
        }
    }
    if (!lookForChildComponents) {
        return res.json({ message: 'Algo deu errado' });
    }
    if (lookForChildComponents.message === 'Algo deu errado') {
        return res.json({ message: 'Algo deu errado' });
    }
    if (lookForChildComponents.message === 'Valores Reservados') {
        res.cookie('reservedItens', lookForChildComponents.reserved);
        res.cookie('codigoFilho', lookForChildComponents.codigoFilho);
        res.cookie('condic', lookForChildComponents.condic);
        return res.json({ message: 'Valores Reservados' });
    }
    if (lookForChildComponents.message === 'Quantidade para reserva inválida') {
        return res.json({ message: 'Quantidade para reserva inválida' });
    }
    if (lookForChildComponents.message === 'Não há item para reservar') {
        console.log("linha 168/pointer.ts/");
        return res.json({ message: 'Não há item para reservar' });
    }
};
exports.searchOdf = searchOdf;
//# sourceMappingURL=searchOdf.js.map