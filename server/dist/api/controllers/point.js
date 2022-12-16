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
const decodeOdf_1 = require("../utils/decodeOdf");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const point = async (req, res) => {
    try {
        var qtdBoas = Number((0, sanitize_1.sanitize)(req.body["valorFeed"])) || 0;
        var supervisor = (0, sanitize_1.sanitize)(req.body["supervisor"]) || null;
        var motivorefugo = (0, sanitize_1.sanitize)(req.body["value"]) || null;
        var badFeed = Number((0, sanitize_1.sanitize)(req.body["badFeed"])) || 0;
        var missingFeed = Number((0, sanitize_1.sanitize)(req.body["missingFeed"])) || 0;
        var reworkFeed = Number((0, sanitize_1.sanitize)(req.body["reworkFeed"])) || 0;
        var condic;
        if (!req.cookies['condic']) {
            condic = null;
        }
        else {
            condic = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['condic']))) || null;
        }
        var odfNumber = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
        var codigoPeca = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
        var qtdLibMax = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || null;
        var employee = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])) || null;
        var revisao = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['REVISAO'])) || null;
        var updateQtyQuery = [];
        var updateQtyQuery2 = [];
        var decodedOdfNumber = Number((0, decodeOdf_1.decodedBuffer)(String(req.cookies['encodedOdfNumber'])));
        var decodedOperationNumber = Number((0, decodeOdf_1.decodedBuffer)(String(req.cookies['encodedOperationNuber'])));
        var decodedMachineCode = String((0, decodeOdf_1.decodedBuffer)(String(req.cookies['encodedMachineCode'])));
        res.cookie("startRip", Number(new Date().getTime()));
    }
    catch (error) {
        console.log('Error on point.ts --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    var response = {
        message: '',
        balance: 0,
        url: '',
    };
    if (decodedOdfNumber !== odfNumber || decodedOperationNumber !== operationNumber || decodedMachineCode !== machineCode) {
        console.log('cookies alterados');
        return res.json({ message: 'ODF criptografada e decodificada não coincidem' });
    }
    const valorTotalApontado = (Number(qtdBoas) + Number(badFeed) + Number(missingFeed) + Number(reworkFeed));
    let faltante = qtdLibMax - valorTotalApontado;
    const finalProdTimer = Number(new Date().getTime() - Number((0, decryptedOdf_1.decrypted)(String(req.cookies['startProd']))) / 1000) || 0;
    const pointCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, employee);
    if (pointCode.message !== 'Ini Prod') {
        return res.json({ message: pointCode.message });
    }
    if (pointCode.funcionario !== employee) {
        return res.json({ message: 'Funcionario diferente' });
    }
    if (!valorTotalApontado) {
        return res.json({ message: 'Algo deu errado' });
    }
    if (!supervisor && valorTotalApontado === qtdLibMax) {
        if (badFeed > 0) {
            return res.json({ message: 'Supervisor inválido' });
        }
        else {
            supervisor = '004067';
        }
    }
    if (!qtdLibMax) {
        console.log("linha 68 /point.ts/ qtdLibMax /", qtdLibMax);
        return res.json({ message: 'Quantidade inválida' });
    }
    if (!machineCode || machineCode === '0' || machineCode === '00' || machineCode === '000' || machineCode === '0000' || machineCode === '00000') {
        return res.json({ message: 'Código máquina inválido' });
    }
    if (!operationNumber) {
        return res.json({ message: 'Número operação inválido' });
    }
    if (!codigoPeca || codigoPeca === '0' || codigoPeca === '00' || codigoPeca === '000' || codigoPeca === '0000' || codigoPeca === '00000') {
        return res.json({ message: 'Código de peça inválido' });
    }
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
        response.balance = qtdLibMax;
        console.log('lina 118 /searchOdf/');
        return res.json({ message: 'valor apontado maior que a quantidade liberada' });
    }
    if (badFeed > 0) {
        if (!motivorefugo) {
            console.log("Não foi dado motivo para o refugo");
            return res.json({ message: 'Algo deu errado' });
        }
        const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`;
        const findSupervisor = await (0, select_1.select)(lookForSupervisor);
        if (!findSupervisor) {
            return res.json({ message: 'Supervisor não encontrado' });
        }
    }
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
            let diferenceBetween = execut * qtdLibMax - valorTotalApontado * execut;
            console.log('diference', diferenceBetween);
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
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
                    const updateQuery = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${odfNumber}' AND CODIGO_FILHO = '${element}'`;
                    const s = `UPDATE OPERACAO SET STATUS_RESERVA = NULL WHERE 1 = 1 AND NUMPEC =  TRIM('${codigoPeca}') AND NUMITE = '${element}' AND REVISAO = ${revisao}`;
                    a.push(s);
                    updateQtyQuery2.push(updateQuery);
                });
                await connection.query(updateQtyQuery2.join("\n")).then(result => result.rowsAffected);
                await connection.query(a.join("\n")).then(result => result.rowsAffected);
            }
            catch (error) {
                console.log("linha 185 /Point.ts/", error);
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
    if (missingFeed > 0) {
        faltante = missingFeed;
    }
    const lib = qtdLibMax - valorTotalApontado;
    console.log('badFeed', badFeed);
    console.log('missing', faltante);
    console.log('missing', reworkFeed);
    try {
        console.log("linha 228 /point.ts/ Alterando quantidade apontada...");
        const updateCol = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + ${valorTotalApontado}, QTD_REFUGO = COALESCE(QTD_REFUGO, 0) + ${badFeed}, QTDE_LIB = ${lib}, QTD_FALTANTE = ${faltante}, QTD_BOAS = COALESCE(QTD_BOAS, 0) + ${qtdBoas}, QTD_RETRABALHADA = COALESCE(QTD_RETRABALHADA, 0) + ${reworkFeed} WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${operationNumber} AND CODIGO_MAQUINA = '${machineCode}'`;
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
        await (0, insert_1.insertInto)(employee, odfNumber, codigoPeca, revisao, String(operationNumber), machineCode, qtdLibMax, qtdBoas, badFeed, codAponta, descricaoCodigoAponta, motivorefugo, faltante, reworkFeed, finalProdTimer);
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