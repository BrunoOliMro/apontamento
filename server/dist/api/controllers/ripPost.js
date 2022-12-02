"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const update_1 = require("../services/update");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const ripPost = async (req, res) => {
    const setup = (req.body['setup']);
    console.log('linha 11 /ripPost.ts/', setup);
    let keySan;
    let valueSan;
    const NUMERO_ODF = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF']))) || 0;
    const NUMERO_OPERACAO = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO'])) || null;
    const CODIGO_MAQUINA = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['employee'])) || null;
    const revisao = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO'])));
    const qtdLibMax = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['quantidade']))) || 0;
    const updateQtyQuery = [];
    const especif = (req.cookies['especif']) || null;
    const numCar = (req.cookies['numCar']) || null;
    const lie = (req.cookies['lie']) || null;
    const lse = (req.cookies['lse']) || null;
    const instrumento = (req.cookies['instrumento']) || null;
    const descricao = (req.cookies['descricao']) || null;
    var objectSanitized = {};
    const boas = 0;
    const ruins = 0;
    const codAponta = 6;
    const descricaoCodAponta = 'Rip Fin';
    const motivo = '';
    const faltante = 0;
    const retrabalhada = 0;
    const tempoDecorridoRip = new Date().getTime() - req.cookies['startRip'];
    if (Object.keys(setup).length <= 0) {
        console.log('Apagando cookies');
        res.clearCookie('NUMERO_ODF');
        res.clearCookie('NUMERO_OPERACAO');
        res.clearCookie('qtdBoas');
        res.clearCookie('startSetupTime');
        res.clearCookie('MAQUINA_PROXIMA');
        res.clearCookie('qtdLibMax');
        res.clearCookie('OPERACAO_PROXIMA');
        res.clearCookie('codigoFilho');
        res.clearCookie('execut');
        res.clearCookie('condic');
        res.clearCookie('startRip');
        res.clearCookie('encodedOperationNumber');
        res.clearCookie('numCar');
        res.clearCookie('lie');
        res.clearCookie('lse');
        res.clearCookie('quantidade');
        res.clearCookie('CODIGO_PECA');
        res.clearCookie('REVISAO');
        res.clearCookie('descricao');
        res.clearCookie('instrumento');
        res.clearCookie('startProd');
        res.clearCookie('especif');
        res.clearCookie('employee');
        res.clearCookie('reservedItens');
        res.clearCookie('CODIGO_MAQUINA');
        res.clearCookie('encodedMachineCode');
        res.clearCookie('cstNumope');
        res.clearCookie('encodedOdfNumber');
        res.clearCookie('badge');
        return res.json({ message: "rip vazia" });
    }
    else {
        for (const [key, value] of Object.entries(setup)) {
            keySan = (0, sanitize_1.sanitize)(key);
            valueSan = (0, sanitize_1.sanitize)(value);
            objectSanitized[keySan] = valueSan;
        }
    }
    try {
        console.log('linha 59');
        await (0, insert_1.insertInto)(funcionario, NUMERO_ODF, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorridoRip);
    }
    catch (error) {
        console.log('linha 64 - ripPost -', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        console.log('linha 70');
        const updatePcpProg = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`;
        await (0, update_1.update)(updatePcpProg);
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'ocorreu um erro ao enviar os dados da rip' });
    }
    console.log('ubyvtyv');
    const resultSplitLines = Object.keys(objectSanitized).reduce((acc, iterator) => {
        const [col, lin] = iterator.split("-");
        if (acc[lin] === undefined)
            acc[lin] = {};
        acc[lin][col] = objectSanitized[iterator];
        return acc;
    }, {});
    try {
        Object.entries(resultSplitLines).forEach(([row], i) => {
            if (resultSplitLines[row].SETUP === "ok" && lie[i] === null && lse[i] === null) {
                resultSplitLines[row] = 0;
            }
            updateQtyQuery.push(`INSERT INTO CST_RIP_ODF_PRODUCAO (ODF, ITEM, REVISAO, NUMCAR, DESCRICAO, ESPECIFICACAO, LIE, LSE, SETUP, M2, M3,M4,M5,M6,M7,M8,M9,M10,M11,M12,M13, INSTRUMENTO, OPE_MAQUIN, OPERACAO) 
                VALUES('${NUMERO_ODF}','1', '${revisao}' , '${numCar[i]}', '${descricao[i]}',  '${especif[i]}',${lie[i]}, ${lse[i]},${resultSplitLines[row].SETUP ? `'${resultSplitLines[row].SETUP}'` : null},${resultSplitLines[row].M2 ? `${resultSplitLines[row].M2}` : null},${resultSplitLines[row].M3 ? `${resultSplitLines[row].M3}` : null},${resultSplitLines[row].M4 ? `${resultSplitLines[row].M4}` : null},${resultSplitLines[row].M5 ? `${resultSplitLines[row].M5}` : null},${resultSplitLines[row].M6 ? `${resultSplitLines[row].M6}` : null},${resultSplitLines[row].M7 ? `${resultSplitLines[row].M7}` : null},${resultSplitLines[row].M8 ? `${resultSplitLines[row].M8}` : null},${resultSplitLines[row].M9 ? `${resultSplitLines[row].M9}` : null},${resultSplitLines[row].M10 ? `${resultSplitLines[row].M10}` : null},${resultSplitLines[row].M11 ? `${resultSplitLines[row].M11}` : null},${resultSplitLines[row].M12 ? `${resultSplitLines[row].M12}` : null},${resultSplitLines[row].M13 ? `${resultSplitLines[row].M13}` : null},'${instrumento[i]}','${CODIGO_MAQUINA}','${NUMERO_OPERACAO}')`);
        });
        try {
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
            await connection.query(updateQtyQuery.join("\n"));
        }
        catch (error) {
            console.log("error - linha 98 /ripPost.ts/ - ", error);
            return res.json({ message: "ocorreu um erro ao enviar os dados da rip" });
        }
        const response = {
            message: "rip enviada, odf finalizada",
            url: '/#/codigobarras'
        };
        console.log('Apagando cookies');
        res.clearCookie('NUMERO_ODF');
        res.clearCookie('NUMERO_OPERACAO');
        res.clearCookie('qtdBoas');
        res.clearCookie('startSetupTime');
        res.clearCookie('MAQUINA_PROXIMA');
        res.clearCookie('qtdLibMax');
        res.clearCookie('OPERACAO_PROXIMA');
        res.clearCookie('codigoFilho');
        res.clearCookie('execut');
        res.clearCookie('condic');
        res.clearCookie('startRip');
        res.clearCookie('encodedOperationNumber');
        res.clearCookie('numCar');
        res.clearCookie('lie');
        res.clearCookie('lse');
        res.clearCookie('quantidade');
        res.clearCookie('CODIGO_PECA');
        res.clearCookie('REVISAO');
        res.clearCookie('descricao');
        res.clearCookie('instrumento');
        res.clearCookie('startProd');
        res.clearCookie('especif');
        res.clearCookie('employee');
        res.clearCookie('reservedItens');
        res.clearCookie('CODIGO_MAQUINA');
        res.clearCookie('encodedMachineCode');
        res.clearCookie('cstNumope');
        res.clearCookie('encodedOdfNumber');
        res.clearCookie('badge');
        return res.json(response);
    }
    catch (error) {
        console.log("linha 75 /ripPost/", error);
        return res.json({ message: "ocorreu um erro ao enviar os dados da rip" });
    }
};
exports.ripPost = ripPost;
//# sourceMappingURL=ripPost.js.map