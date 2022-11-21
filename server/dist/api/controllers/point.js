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
    let motivorefugo = String((0, sanitize_1.sanitize)(req.body["value"])) || null;
    let badFeed = Number((0, sanitize_1.sanitize)(req.body["badFeed"])) || 0;
    let missingFeed = Number((0, sanitize_1.sanitize)(req.body["missingFeed"])) || 0;
    let reworkFeed = Number((0, sanitize_1.sanitize)(req.body["reworkFeed"])) || 0;
    console.log("linha 21 /point/", qtdBoas);
    var codigoFilho = ((req.cookies['codigoFilho'])) || null;
    var reservedItens = (req.cookies['reservedItens']) || null;
    let condic = String((0, sanitize_1.sanitize)(req.cookies['CONDIC'])) || null;
    let NUMERO_ODF = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    NUMERO_ODF = Number(NUMERO_ODF);
    let NUMERO_OPERACAO = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
    let CODIGO_MAQUINA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['qtdLibMax']))) || null;
    let MAQUINA_PROXIMA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['MAQUINA_PROXIMA']))) || null;
    let OPERACAO_PROXIMA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['OPERACAO_PROXIMA']))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const updateQtyQuery = [];
    let startRip = Number(new Date()) || 0;
    res.cookie("startRip", startRip);
    let endProdTimer = new Date() || 0;
    let startProd = Number(req.cookies["startProd"] / 1000) || 0;
    let finalProdTimer = Number(endProdTimer.getTime() - startProd / 1000) || 0;
    let valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed));
    let faltante = qtdLibMax - valorTotalApontado;
    qtdLibMax = Number(qtdLibMax);
    console.log("linha irvnir 55");
    console.log("linha 57", valorTotalApontado);
    if (!supervisor || supervisor === 'undefined' || supervisor === '' && valorTotalApontado === qtdLibMax) {
        supervisor = '004067';
    }
    console.log("linha 62 /point/", !supervisor);
    if (!supervisor || supervisor === 'undefined' || supervisor === '' || supervisor === '000000' || supervisor === '0' || supervisor === '00' || supervisor === '000' || supervisor === '0000' || supervisor === '00000') {
        return res.json({ message: 'Supervisor inválido' });
    }
    if (!qtdLibMax || qtdLibMax === 0) {
        return res.json({ message: 'Quantidade inválida' });
    }
    console.log("iewbhu7ergbvrhb8r");
    if (CODIGO_MAQUINA === null || CODIGO_MAQUINA === undefined || CODIGO_MAQUINA === '' || CODIGO_MAQUINA === '0' || CODIGO_MAQUINA === '00' || CODIGO_MAQUINA === '000' || CODIGO_MAQUINA === '0000' || CODIGO_MAQUINA === '00000') {
        return res.json({ message: 'Código máquina inválido' });
    }
    if (NUMERO_OPERACAO === null || NUMERO_OPERACAO === undefined || NUMERO_OPERACAO === '' || NUMERO_OPERACAO === '0' || NUMERO_OPERACAO === '00' || NUMERO_OPERACAO === '000' || NUMERO_OPERACAO === '0000' || NUMERO_OPERACAO === '00000') {
        return res.json({ message: 'Número operação inválido' });
    }
    if (codigoPeca === null || codigoPeca === undefined || codigoPeca === '' || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000') {
        return res.json({ message: 'Código de peça inválido' });
    }
    console.log("o3u3bub43");
    if (NUMERO_ODF === 0 || NUMERO_ODF === null || NUMERO_ODF === undefined) {
        return res.json({ message: 'Número odf inválido' });
    }
    if (funcionario === undefined || funcionario === null || funcionario === '' || funcionario === '0') {
        return res.json({ message: 'Funcionário Inválido' });
    }
    if (qtdBoas > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed > qtdLibMax || missingFeed > qtdLibMax || reworkFeed > qtdLibMax) {
        return res.json({ message: 'Quantidade excedida' });
    }
    console.log("linha 56 /point/", qtdBoas);
    if (qtdBoas === null || qtdBoas === undefined || missingFeed === null || missingFeed === undefined || valorTotalApontado === null || valorTotalApontado === undefined) {
        return res.json({ message: 'Quantidade inválida' });
    }
    if (missingFeed <= 0) {
        faltante = qtdLibMax - valorTotalApontado;
    }
    console.log("linha 98", motivorefugo);
    if (motivorefugo === undefined || motivorefugo === "undefined") {
        motivorefugo = null;
    }
    console.log("linha 104", motivorefugo);
    if (valorTotalApontado > qtdLibMax) {
        return res.json({ message: 'valor apontado maior que a quantidade liberada' });
    }
    console.log("linha 110 /point/", valorTotalApontado);
    if (badFeed > 0) {
        const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`;
        const resource = await (0, select_1.select)(lookForSupervisor);
        if (resource.length <= 0) {
            return res.json({ message: 'Supervisor não encontrado' });
        }
    }
    console.log("linha 122", badFeed);
    if (condic === undefined || condic === null || condic === 'undefined') {
        condic = "D";
        codigoFilho = [];
    }
    console.log("linha 130", condic);
    try {
        if (condic === 'P') {
            try {
                for (const [i, qtdItem] of reservedItens.entries()) {
                    let updateQuery = `UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}' `;
                    updateQtyQuery.push((0, update_1.update)(updateQuery));
                }
                await connection.query(updateQtyQuery.join("\n"));
            }
            catch (err) {
                return res.json({ message: 'erro ao efetivar estoque das peças filhas ' });
            }
        }
        console.log("linha 147", condic);
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'erro ao verificar o "P' });
    }
    try {
        if (valorTotalApontado < qtdLibMax) {
            const updateNextProcess = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF}  AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`;
            await (0, update_1.update)(updateNextProcess);
        }
        console.log("linha 172");
        if (valorTotalApontado >= qtdLibMax) {
            const updateQtdpointed = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`;
            await (0, update_1.update)(updateQtdpointed);
        }
        console.log("linha 179");
        const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`;
        await (0, update_1.update)(updateCol);
        let codAponta = 4;
        let descricaoCodigoAponta = 'Fin Prod';
        await (0, insert_1.insertInto)(funcionario, NUMERO_ODF, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, qtdBoas, badFeed, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed, finalProdTimer);
        console.log("linha 193", qtdBoas);
        qtdBoas = (0, encryptOdf_1.encrypted)(String(qtdBoas));
        res.cookie('qtdBoas', qtdBoas);
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