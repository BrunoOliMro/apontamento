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
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const point = async (req, res) => {
    let qtdBoas = Number((0, sanitize_1.sanitize)(req.body["valorFeed"])) || null;
    let supervisor = (0, sanitize_1.sanitize)(req.body["supervisor"]) || null;
    const motivorefugo = (0, sanitize_1.sanitize)(req.body["value"]) || null;
    const badFeed = Number((0, sanitize_1.sanitize)(req.body["badFeed"])) || null;
    const missingFeed = Number((0, sanitize_1.sanitize)(req.body["missingFeed"])) || null;
    const reworkFeed = Number((0, sanitize_1.sanitize)(req.body["reworkFeed"])) || null;
    let condic;
    if (!req.cookies['condic']) {
        condic = null;
    }
    else {
        condic = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['condic']))) || null;
    }
    const odfNumber = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    const operationNumber = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"])) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])) || null;
    const machineCode = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"])) || null;
    const qtdLibMax = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || null;
    const employee = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])) || null;
    const revisao = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || null;
    const updateQtyQuery = [];
    const updateQtyQuery2 = [];
    var response = {
        message: '',
        balance: 0,
        url: '',
    };
    res.cookie("startRip", Number(new Date().getTime()));
    const finalProdTimer = Number(new Date().getTime() - Number((0, decryptedOdf_1.decrypted)(String(req.cookies['startProd']))) / 1000) || 0;
    const valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed));
    let faltante = qtdLibMax - valorTotalApontado;
    console.log("linha 56 /point.ts/");
    const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode);
    if (x !== 'Ini Prod') {
        return res.json({ message: x });
    }
    if (!valorTotalApontado) {
        return res.json({ message: 'Algo deu errado' });
    }
    if (!supervisor || supervisor === '' && valorTotalApontado === qtdLibMax) {
        if (badFeed > 0) {
            return res.json({ message: 'Supervisor inválido' });
        }
        else {
            supervisor = '004067';
        }
    }
    console.log("linha 62 Supervisor /point.ts/", supervisor);
    if (!supervisor || supervisor === '' || supervisor === '000000' || supervisor === '0' || supervisor === '00' || supervisor === '000' || supervisor === '0000' || supervisor === '00000') {
        console.log("linha 64");
        return res.json({ message: 'Supervisor inválido' });
    }
    console.log("linha 68", qtdLibMax);
    if (!qtdLibMax) {
        console.log("linha 68 /point.ts/ qtdLibMax /", qtdLibMax);
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
    if (!odfNumber) {
        console.log('linha 99 /searchOdf/');
        return res.json({ message: 'Número odf inválido' });
    }
    if (!employee || employee === '0') {
        console.log('linha 103 /searchOdf/');
        return res.json({ message: 'Funcionário Inválido' });
    }
    if (qtdBoas > qtdLibMax || valorTotalApontado > qtdLibMax || badFeed > qtdLibMax || missingFeed > qtdLibMax || reworkFeed > qtdLibMax) {
        console.log('linha 107 /searchOdf/');
        return res.json({ message: 'Quantidade excedida' });
    }
    console.log('faltante', faltante);
    if (!missingFeed) {
        faltante = qtdLibMax - valorTotalApontado;
    }
    if (valorTotalApontado > qtdLibMax) {
        console.log('lina 118 /searchOdf/');
        return res.json({ message: 'valor apontado maior que a quantidade liberada' });
    }
    if (badFeed > 0) {
        if (!motivorefugo) {
            console.log(["Não foi dado motivo para o refugo"]);
            return res.json({ message: 'Algo deu errado' });
        }
        const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`;
        const findSupervisor = await (0, select_1.select)(lookForSupervisor);
        if (findSupervisor === 'Algo deu errado' || findSupervisor === 'Data not found') {
            return res.json({ message: 'Supervisor não encontrado' });
        }
    }
    if (valorTotalApontado > qtdLibMax) {
        console.log('linha 145 /não da pra fazer essa operação/');
        response.message = 'Saldo menor que o apontado';
        response.balance = qtdLibMax;
        console.log('linha 148/response/', response);
        return res.json(response);
    }
    console.log('linha 147 /searchOdf/', condic);
    if (condic === 'P') {
        if (!req.cookies['execut']) {
            return res.json({ message: 'Algo deu errado' });
        }
        let execut = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['execut'])));
        let codigoFilho;
        if (!req.cookies['codigoFilho']) {
            return res.json({ message: 'Algo deu errado' });
        }
        else {
            codigoFilho = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['codigoFilho']))).split(",") || null;
            if (!codigoFilho) {
                console.log(["Sem dados dos filhos"]);
                return res.json({ message: 'Algo deu errado' });
            }
        }
        try {
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
            let diferenceBetween = execut * qtdLibMax - valorTotalApontado * execut;
            if (valorTotalApontado < qtdLibMax) {
                try {
                    codigoFilho.forEach((codigoFilho) => {
                        updateQtyQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${diferenceBetween} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`);
                    });
                    await connection.query(updateQtyQuery.join("\n")).then(result => result.rowsAffected);
                }
                catch (error) {
                    console.log("linha 159 /point.ts/", error);
                    return res.json({ message: 'Algo deu errado' });
                }
            }
            try {
                let a = [];
                codigoFilho.forEach((element) => {
                    const updateQuery = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumber}' AND CODIGO_FILHO = '${element}' `;
                    const s = `UPDATE OPERACAO SET STATUS_RESERVA = NULL WHERE 1 = 1 AND NUMPEC =  TRIM('${codigoPeca}') AND NUMITE = '${element}' AND REVISAO = ${revisao}`;
                    a.push(s);
                    updateQtyQuery2.push(updateQuery);
                });
                await connection.query(updateQtyQuery2.join("\n")).then(result => result.rowsAffected);
                await connection.query(a.join("\n")).then(result => result.rowsAffected);
            }
            catch (error) {
                console.log("linha 185 /selectHasP/", error);
                return res.json({ message: 'Algo deu errado' });
            }
            finally {
                await connection.close();
            }
        }
        catch (err) {
            console.log("linha 175  -Point.ts-", err);
            return res.json({ message: 'erro ao efetivar estoque das peças filhas' });
        }
    }
    try {
        console.log("linha 228 /point.ts/ Alterando quantidade apontada...");
        let d = valorTotalApontado - qtdLibMax;
        console.log('d', d);
        console.log('faltante', faltante);
        console.log('valorTotalApontado', valorTotalApontado);
        const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + ${qtdBoas}, QTD_REFUGO = ${badFeed}, QTDE_LIB = QTDE_LIB - ${faltante}, QTD_FALTANTE = ${faltante} WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`;
        await (0, update_1.update)(updateCol);
    }
    catch (error) {
        console.log("linha 209 - error - /point.ts/", error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        console.log("linha 238 /point.ts/ Inserindo dados de apontamento...");
        const codAponta = 4;
        const descricaoCodigoAponta = 'Fin Prod';
        await (0, insert_1.insertInto)(employee, odfNumber, codigoPeca, revisao, operationNumber, machineCode, qtdLibMax, qtdBoas, badFeed, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed, finalProdTimer);
    }
    catch (error) {
        console.log("erro ao fazer insert linha 220 /point.ts/", error);
        return res.json({ message: 'Algo deu errado' });
    }
    qtdBoas = (0, encryptOdf_1.encrypted)(String(qtdBoas));
    res.cookie('qtdBoas', qtdBoas);
    return res.json({ message: 'Sucesso ao apontar' });
};
exports.point = point;
//# sourceMappingURL=point.js.map