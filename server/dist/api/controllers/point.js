"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const update_1 = require("../services/update");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const point = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let qtdBoas = Number((0, sanitize_1.sanitize)(req.body["valorFeed"])) || 0;
    let supervisor = String((0, sanitize_1.sanitize)(req.body["supervisor"])) || null;
    let motivorefugo = String((0, sanitize_1.sanitize)(req.body["value"]));
    let badFeed = Number((0, sanitize_1.sanitize)(req.body["badFeed"])) || 0;
    let missingFeed = Number((0, sanitize_1.sanitize)(req.body["missingFeed"])) || 0;
    let reworkFeed = Number((0, sanitize_1.sanitize)(req.body["reworkFeed"])) || 0;
    console.log("linha 21 /point.ts/", qtdBoas);
    var codigoFilho = ((req.cookies['codigoFilho'])) || null;
    var reservedItens = (req.cookies['reservedItens']) || null;
    let condic = String((0, sanitize_1.sanitize)(req.cookies['condic'])) || null;
    console.log("linha 27 /codigoFilho/", codigoFilho);
    console.log("linha 27 /reservedItens/", reservedItens);
    console.log("linha 27 /condic/", condic);
    let NUMERO_ODF = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    NUMERO_ODF = Number(NUMERO_ODF);
    let NUMERO_OPERACAO = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
    let CODIGO_MAQUINA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['qtdLibMax']))) || null;
    let MAQUINA_PROXIMA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['MAQUINA_PROXIMA']))) || null;
    let OPERACAO_PROXIMA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['OPERACAO_PROXIMA']))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['employee']))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    let numite = (req.cookies['codigoFilho']) || null;
    const updateQtyQuery = [];
    let startRip = Number(new Date()) || 0;
    res.cookie("startRip", startRip);
    let endProdTimer = new Date() || 0;
    let startProd = Number(req.cookies["startProd"] / 1000) || 0;
    let finalProdTimer = Number(endProdTimer.getTime() - startProd / 1000) || 0;
    let valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed));
    let faltante = qtdLibMax - valorTotalApontado;
    qtdLibMax = Number(qtdLibMax);
    console.log("linha 56 /point.ts/");
    if (!supervisor || supervisor === 'undefined' || supervisor === '' && valorTotalApontado === qtdLibMax) {
        supervisor = '004067';
    }
    console.log("linha 62 Supervisor /point.ts/", supervisor);
    if (!supervisor || supervisor === 'undefined' || supervisor === '' || supervisor === '000000' || supervisor === '0' || supervisor === '00' || supervisor === '000' || supervisor === '0000' || supervisor === '00000') {
        return res.json({ message: 'Supervisor inválido' });
    }
    if (!qtdLibMax || qtdLibMax === 0) {
        return res.json({ message: 'Quantidade inválida' });
    }
    console.log("linha 73 /point.ts/");
    if (CODIGO_MAQUINA === null || CODIGO_MAQUINA === undefined || CODIGO_MAQUINA === '' || CODIGO_MAQUINA === '0' || CODIGO_MAQUINA === '00' || CODIGO_MAQUINA === '000' || CODIGO_MAQUINA === '0000' || CODIGO_MAQUINA === '00000') {
        return res.json({ message: 'Código máquina inválido' });
    }
    if (NUMERO_OPERACAO === null || NUMERO_OPERACAO === undefined || NUMERO_OPERACAO === '' || NUMERO_OPERACAO === '0' || NUMERO_OPERACAO === '00' || NUMERO_OPERACAO === '000' || NUMERO_OPERACAO === '0000' || NUMERO_OPERACAO === '00000') {
        return res.json({ message: 'Número operação inválido' });
    }
    if (!codigoPeca || codigoPeca === '' || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000') {
        return res.json({ message: 'Código de peça inválido' });
    }
    console.log("linha 87 /point.ts/");
    if (NUMERO_ODF === 0 || NUMERO_ODF === null || NUMERO_ODF === undefined) {
        return res.json({ message: 'Número odf inválido' });
    }
    if (funcionario === undefined || funcionario === null || funcionario === '' || funcionario === '0') {
        return res.json({ message: 'Funcionário Inválido' });
    }
    if (qtdBoas > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed > qtdLibMax || missingFeed > qtdLibMax || reworkFeed > qtdLibMax) {
        return res.json({ message: 'Quantidade excedida' });
    }
    console.log("linha 56 Boas /point.ts/", qtdBoas);
    if (qtdBoas === null || qtdBoas === undefined || missingFeed === null || missingFeed === undefined || valorTotalApontado === null || valorTotalApontado === undefined) {
        return res.json({ message: 'Quantidade inválida' });
    }
    if (missingFeed <= 0) {
        faltante = qtdLibMax - valorTotalApontado;
    }
    console.log("linha 113 Faltante  /point.ts/", faltante);
    if (motivorefugo === undefined || motivorefugo === "undefined") {
        motivorefugo = '';
    }
    console.log("linha 119  - Motivo /point.ts/", motivorefugo);
    if (valorTotalApontado > qtdLibMax) {
        return res.json({ message: 'valor apontado maior que a quantidade liberada' });
    }
    if (badFeed > 0) {
        const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`;
        const resource = await (0, select_1.select)(lookForSupervisor);
        if (resource.length <= 0) {
            return res.json({ message: 'Supervisor não encontrado' });
        }
    }
    console.log("linha 137 BadFeed / point.ts/ ", badFeed);
    if (condic === undefined || condic === null || condic === 'undefined') {
        condic = "D";
        codigoFilho = [];
    }
    if (condic === 'P') {
        try {
            let query;
            let min = Math.min(...reservedItens);
            let diferença = min - valorTotalApontado;
            if (valorTotalApontado < min) {
                try {
                    console.log("Atualizando estoque...");
                    console.log("linha 163/diferença/", diferença);
                    for (const [i] of reservedItens.entries()) {
                        let updateQuery = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${diferença} WHERE 1 = 1 AND CODIGO = '${codigoFilho[i]}' `;
                        updateQtyQuery.push(updateQuery);
                    }
                    query = await connection.query(updateQtyQuery.join("\n")).then(result => result.rowsAffected);
                    let minValue = Math.min(...query);
                    if (minValue <= 0) {
                        return res.json({ message: 'Algo deu errado' });
                    }
                }
                catch (error) {
                    console.log("linha 180 /point.ts/", error);
                    return res.json({ message: 'Algo deu errado' });
                }
            }
            if (query) {
                console.log("Deletando cst alocacao...");
                try {
                    for (const [i] of reservedItens.entries()) {
                        let updateQuery = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}' `;
                        updateQtyQuery.push(updateQuery);
                    }
                    let deletQuery = await connection.query(updateQtyQuery.join("\n")).then(result => result.rowsAffected);
                    if (!deletQuery) {
                        return res.json({ message: 'Algo deu errado' });
                    }
                }
                catch (error) {
                    console.log("linha 185 /selectHasP/", error);
                    return res.json({ message: 'Algo deu errado' });
                }
            }
        }
        catch (err) {
            return res.json({ message: 'erro ao efetivar estoque das peças filhas' });
        }
    }
    try {
        if (valorTotalApontado < qtdLibMax) {
            const updateNextProcess = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF}  AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`;
            await (0, update_1.update)(updateNextProcess);
        }
        if (valorTotalApontado >= qtdLibMax) {
            const updateQtdpointed = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`;
            await (0, update_1.update)(updateQtdpointed);
        }
        console.log("linha 184 - valor Apontado /point.ts/", valorTotalApontado);
        const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`;
        await (0, update_1.update)(updateCol);
        try {
            console.log("linha 189 /point.ts/ Inserindo dados de apontamento...");
            let codAponta = 4;
            let descricaoCodigoAponta = 'Fin Prod';
            await (0, insert_1.insertInto)(funcionario, NUMERO_ODF, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, qtdBoas, badFeed, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed, finalProdTimer);
        }
        catch (error) {
            console.log("erro ao fazer insert linha 188 /point.ts/");
        }
        qtdBoas = (0, encryptOdf_1.encrypted)(String(qtdBoas));
        res.cookie('qtdBoas', qtdBoas);
        console.log("linha 197 - chegou ao fim /point.ts/", qtdBoas);
        return res.json({ message: 'Sucesso ao apontar' });
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'Erro ao apontar' });
    }
    finally {
    }
};
exports.point = point;
//# sourceMappingURL=point.js.map