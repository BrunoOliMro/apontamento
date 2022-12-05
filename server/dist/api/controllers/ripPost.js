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
const clearCookie_1 = require("../utils/clearCookie");
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
    const funcionario = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CRACHA'])) || null;
    const revisao = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO'])));
    const qtdLibMax = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || 0;
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
    const motivo = null;
    const faltante = 0;
    const retrabalhada = 0;
    const tempoDecorridoRip = new Date().getTime() - Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['startRip'])));
    if (Object.keys(setup).length <= 0) {
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
        const x = await (0, insert_1.insertInto)(funcionario, NUMERO_ODF, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorridoRip);
        if (x === 'Error on insert into' || x === 'insert was not done' || x === 'Algo deu errado') {
            return res.json({ message: 'Algo deu errado' });
        }
        else if (x === 'insert done') {
            try {
                const updatePcpProg = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${NUMERO_ODF} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${CODIGO_MAQUINA}'`;
                const y = await (0, update_1.update)(updatePcpProg);
                if (y === 'Algo deu errado' || y === 'Error on update') {
                    return res.json({ message: 'Algo deu errado' });
                }
                else {
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
                        console.log('Apagando cookies');
                        await (0, clearCookie_1.cookieCleaner)(res);
                        return res.json({ message: 'rip enviada, odf finalizada', url: '/#/codigobarras' });
                    }
                    catch (error) {
                        console.log("linha 75 /ripPost/", error);
                        return res.json({ message: "ocorreu um erro ao enviar os dados da rip" });
                    }
                }
            }
            catch (error) {
                console.log('error linha 72', error);
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else {
            return res.json({ message: 'Algo deu errado' });
        }
    }
    catch (error) {
        console.log('linha 64 - ripPost -', error);
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.ripPost = ripPost;
//# sourceMappingURL=ripPost.js.map