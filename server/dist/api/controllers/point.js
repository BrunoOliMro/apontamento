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
    var codigoFilho = ((req.cookies['codigoFilho'])) || null;
    let condic = String((0, sanitize_1.sanitize)(req.cookies['condic'])) || null;
    let odfNumberDecrypted = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])) || null;
    odfNumberDecrypted = Number(odfNumberDecrypted);
    let operationNumber = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"])) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])) || null;
    let machineCode = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"])) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['qtdLibMax'])) || null;
    let nextMachineProcess = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['MAQUINA_PROXIMA'])) || null;
    let nextOperationProcess = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['OPERACAO_PROXIMA'])) || null;
    console.log("linha 22 /point.ts/", (0, decryptedOdf_1.decrypted)(req.cookies["NUMERO_ODF"]));
    let employee = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['employee'])) || null;
    let revisao = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || null;
    let quantidade = req.cookies['quantidade'];
    const updateQtyQuery = [];
    let startRip = Number(new Date()) || 0;
    res.cookie("startRip", startRip);
    console.log('linha 35 /point.ts/');
    let endProdTimer = new Date() || 0;
    let startProd = Number(req.cookies["startProd"] / 1000) || 0;
    let finalProdTimer = Number(endProdTimer.getTime() - startProd / 1000) || 0;
    let valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed));
    let faltante = qtdLibMax - valorTotalApontado;
    qtdLibMax = Number(qtdLibMax);
    console.log("linha 56 /point.ts/");
    if (!valorTotalApontado) {
        return res.json({ message: 'Algo deu errado' });
    }
    if (!supervisor || supervisor === 'undefined' || supervisor === '' && valorTotalApontado === qtdLibMax) {
        supervisor = '004067';
    }
    console.log("linha 62 Supervisor /point.ts/", supervisor);
    if (!supervisor || supervisor === 'undefined' || supervisor === '' || supervisor === '000000' || supervisor === '0' || supervisor === '00' || supervisor === '000' || supervisor === '0000' || supervisor === '00000') {
        console.log("linha 64");
        return res.json({ message: 'Supervisor inválido' });
    }
    console.log("linha 68", qtdLibMax);
    if (!qtdLibMax || qtdLibMax === 0) {
        return res.json({ message: 'Quantidade inválida' });
    }
    console.log("linha 73 /point.ts/");
    if (!machineCode || machineCode === '' || machineCode === '0' || machineCode === '00' || machineCode === '000' || machineCode === '0000' || machineCode === '00000') {
        return res.json({ message: 'Código máquina inválido' });
    }
    if (!operationNumber || operationNumber === '' || operationNumber === '0' || operationNumber === '00' || operationNumber === '000' || operationNumber === '0000' || operationNumber === '00000') {
        return res.json({ message: 'Número operação inválido' });
    }
    if (!codigoPeca || codigoPeca === '' || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000') {
        return res.json({ message: 'Código de peça inválido' });
    }
    console.log("linha 87 /point.ts/");
    if (!odfNumberDecrypted || odfNumberDecrypted === 0) {
        return res.json({ message: 'Número odf inválido' });
    }
    if (!employee || employee === '' || employee === '0') {
        return res.json({ message: 'Funcionário Inválido' });
    }
    if (qtdBoas > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed > qtdLibMax || missingFeed > qtdLibMax || reworkFeed > qtdLibMax) {
        return res.json({ message: 'Quantidade excedida' });
    }
    console.log("linha 99 Boas /point.ts/", qtdBoas);
    if (missingFeed <= 0) {
        faltante = qtdLibMax - valorTotalApontado;
    }
    console.log("linha 113 Faltante  /point.ts/", faltante);
    if (!motivorefugo || motivorefugo === "undefined") {
        motivorefugo = '';
    }
    if (valorTotalApontado > qtdLibMax) {
        return res.json({ message: 'valor apontado maior que a quantidade liberada' });
    }
    if (badFeed > 0) {
        const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`;
        const findSupervisor = await (0, select_1.select)(lookForSupervisor);
        if (findSupervisor === 'Algo deu errado' || findSupervisor === 'Data not found') {
            return res.json({ message: 'Supervisor não encontrado' });
        }
    }
    if (!condic) {
        condic = "D";
        codigoFilho = [];
    }
    let quantidadePossivelProduzir = Number(req.cookies['quantidade']);
    if (valorTotalApontado > quantidadePossivelProduzir) {
        return res.json({ message: 'Algo deu errado' });
    }
    if (condic === 'P') {
        try {
            let diference = qtdLibMax - valorTotalApontado;
            let returnValueToStorage = diference / 2;
            console.log("diference", returnValueToStorage);
            console.log("qtdLibMax", qtdLibMax);
            console.log("valorTotalApontado", valorTotalApontado);
            if (valorTotalApontado < quantidade) {
                try {
                    for (const [i] of quantidade.length.entries()) {
                        updateQtyQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${returnValueToStorage} WHERE 1 = 1 AND CODIGO = '${codigoFilho[i]}'`);
                    }
                    await connection.query(updateQtyQuery.join("\n")).then(result => result.rowsAffected);
                }
                catch (error) {
                    console.log("linha 159 /point.ts/", error);
                    return res.json({ message: 'Algo deu errado' });
                }
            }
            try {
                for (const [i] of quantidade.length.entries()) {
                    let updateQuery = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumberDecrypted}' AND CODIGO_FILHO = '${codigoFilho[i]}' `;
                    updateQtyQuery.push(updateQuery);
                }
                await connection.query(updateQtyQuery.join("\n")).then(result => result.rowsAffected);
            }
            catch (error) {
                console.log("linha 185 /selectHasP/", error);
                return res.json({ message: 'Algo deu errado' });
            }
        }
        catch (err) {
            console.log("linha 175  -Point.ts-", err);
            return res.json({ message: 'erro ao efetivar estoque das peças filhas' });
        }
    }
    try {
        try {
            if (valorTotalApontado < qtdLibMax) {
                const updateNextProcess = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'S' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumberDecrypted}  AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${nextOperationProcess}' AND CODIGO_MAQUINA = '${nextMachineProcess}'`;
                await (0, update_1.update)(updateNextProcess);
            }
        }
        catch (error) {
            console.log('linha 198 - error - //point.ts', error);
            return res.json({ message: 'Algo deu errado' });
        }
        if (valorTotalApontado === quantidadePossivelProduzir) {
            try {
                const updateQtdpointed = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET APONTAMENTO_LIBERADO = 'N' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumberDecrypted} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${operationNumber}' AND CODIGO_MAQUINA = '${machineCode}'`;
                await (0, update_1.update)(updateQtdpointed);
            }
            catch (error) {
                if (error) {
                    console.log('cadeeeeeee');
                }
                console.log('linha 212 - error - //point.ts', error);
                return res.json({ message: 'Algo deu errado' });
            }
        }
        try {
            const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + '${valorTotalApontado}' WHERE 1 = 1 AND NUMERO_ODF = ${odfNumberDecrypted} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${operationNumber}' AND CODIGO_MAQUINA = '${machineCode}'`;
            await (0, update_1.update)(updateCol);
        }
        catch (error) {
            console.log("linha 209 - error - /point.ts/", error);
            return res.json({ message: 'Algo deu errado' });
        }
        try {
            console.log("linha 215 /point.ts/ Inserindo dados de apontamento...");
            let codAponta = 4;
            let descricaoCodigoAponta = 'Fin Prod';
            await (0, insert_1.insertInto)(employee, odfNumberDecrypted, codigoPeca, revisao, operationNumber, machineCode, qtdLibMax, qtdBoas, badFeed, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed, finalProdTimer);
        }
        catch (error) {
            console.log("erro ao fazer insert linha 220 /point.ts/", error);
            return res.json({ message: 'Algo deu errado' });
        }
        qtdBoas = (0, encryptOdf_1.encrypted)(String(qtdBoas));
        res.cookie('qtdBoas', qtdBoas);
        console.log("linha 227 - chegou ao fim /point.ts/", qtdBoas);
        return res.json({ message: 'Sucesso ao apontar' });
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'Erro ao apontar' });
    }
    finally {
        await connection.close();
    }
};
exports.point = point;
//# sourceMappingURL=point.js.map