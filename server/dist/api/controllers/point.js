"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const sanitize_1 = require("../utils/sanitize");
const point = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let qtdBoas = Number((0, sanitize_1.sanitize)(req.body["valorFeed"])) || 0;
    let supervisor = String((0, sanitize_1.sanitize)(req.body["supervisor"])) || null;
    let motivorefugo = String((0, sanitize_1.sanitize)(req.body["value"])) || null;
    let badFeed = Number((0, sanitize_1.sanitize)(req.body["badFeed"])) || 0;
    let missingFeed = Number((0, sanitize_1.sanitize)(req.body["missingFeed"])) || 0;
    let reworkFeed = Number((0, sanitize_1.sanitize)(req.body["reworkFeed"])) || 0;
    var codigoFilho = ((req.cookies['codigoFilho']));
    var reservedItens = (req.cookies['reservedItens']);
    let NUMERO_ODF = Number((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])) || 0;
    let NUMERO_OPERACAO = String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"])) || null;
    let codigoPeca = String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])) || null;
    let CODIGO_MAQUINA = String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"])) || null;
    let qtdLibMax = Number((0, sanitize_1.sanitize)(req.cookies['qtdLibMax'])) || 0;
    let condic = String((0, sanitize_1.sanitize)(req.cookies['CONDIC'])) || null;
    let MAQUINA_PROXIMA = String((0, sanitize_1.sanitize)(req.cookies['MAQUINA_PROXIMA'])) || null;
    let OPERACAO_PROXIMA = String((0, sanitize_1.sanitize)(req.cookies['OPERACAO_PROXIMA'])) || null;
    let funcionario = String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])) || null;
    let revisao = Number((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || 0;
    const updateQtyQuery = [];
    let startRip = Number(new Date()) || 0;
    res.cookie("startRip", startRip);
    let endProdTimer = new Date() || 0;
    let startProd = Number(req.cookies["startProd"] / 1000) || 0;
    let finalProdTimer = Number(endProdTimer.getTime() - startProd / 1000) || 0;
    let refugoQEstaNoSistema = Number((0, sanitize_1.sanitize)(req.cookies['QTD_REFUGO'])) || 0;
    let retrabalhadas;
    let valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed));
    let faltante = qtdLibMax - valorTotalApontado;
    if (missingFeed <= 0) {
        faltante = qtdLibMax - valorTotalApontado;
    }
    if (reworkFeed > 0) {
        retrabalhadas = reworkFeed - refugoQEstaNoSistema;
    }
    console.log("faltante: ", faltante);
    if (motivorefugo === undefined || motivorefugo === "undefined" || motivorefugo === null) {
        motivorefugo = null;
    }
    if (valorTotalApontado > qtdLibMax) {
        return res.json({ message: 'valor apontado maior que a quantidade liberada' });
    }
    if (badFeed > 0) {
        const resource = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'
        `).then(result => result.recordset);
        if (resource.length <= 0) {
            return res.json({ message: 'supervisor não encontrado' });
        }
    }
    if (condic === undefined || condic === null) {
        condic = "D";
        codigoFilho = [];
    }
    try {
        if (condic === 'P') {
            try {
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateQtyQuery.push(`UPDATE CST_ALOCACAO SET  QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                }
                await connection.query(updateQtyQuery.join("\n"));
            }
            catch (err) {
                return res.json({ message: 'erro ao efetivar estoque das peças filhas ' });
            }
        }
    }
    catch (err) {
        console.log(err);
        return res.json({ message: 'erro ao verificar o "P' });
    }
    try {
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        }
        if (valorTotalApontado < qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${OPERACAO_PROXIMA}' AND CODIGO_MAQUINA = '${MAQUINA_PROXIMA}'`);
        }
        if (valorTotalApontado >= qtdLibMax) {
            await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        }
        await connection.query(`UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = '${NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${NUMERO_OPERACAO}' AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`);
        await connection.query(`INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE)
        VALUES(GETDATE(),'${funcionario}',${NUMERO_ODF},'${codigoPeca}','${revisao}','${NUMERO_OPERACAO}','${NUMERO_OPERACAO}', 'D','${CODIGO_MAQUINA}','1',${qtdBoas},${badFeed},'${funcionario}','0','4', '4', 'Fin Prod.',${finalProdTimer},${finalProdTimer}, '1',  UPPER('${motivorefugo}') , ${faltante})`);
        res.cookie('qtdBoas', qtdBoas);
        return res.json({ message: 'valores apontados com sucesso' });
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro ao enviar o apontamento' });
    }
    finally {
    }
};
exports.point = point;
//# sourceMappingURL=point.js.map