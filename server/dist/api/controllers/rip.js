"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rip = void 0;
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const rip = async (req, res) => {
    try {
        var revision = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO'])))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])))) || null;
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var operationNumber = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO'])))).replaceAll(' ', '') || null;
        var funcionario = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var maxQuantityReleased = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
        var descricaoCodAponta = [`Rip Ini.`];
        var boas = null;
        var ruins = null;
        var faltante = null;
        var retrabalhada = null;
        var codAponta = [5];
        var motivo = null;
        var response = {
            message: '',
            object: '',
        };
        var rip = `
            SELECT  DISTINCT
            PROCESSO.NUMPEC,
            PROCESSO.REVISAO,
            QA_CARACTERISTICA.NUMCAR AS NUMCAR,
            QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE,
            QA_CARACTERISTICA.DESCRICAO,
            ESPECIFICACAO  AS ESPECIF,
            LIE,
            LSE,
            QA_CARACTERISTICA.INSTRUMENTO
            FROM PROCESSO
            INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO
            INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC
            AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA 
            AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO 
            LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA  
            FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE
            WHERE PROCESSO.NUMPEC = '${partCode}' 
            AND PROCESSO.REVISAO = '${revision}' 
            AND CST_NUMOPE = '${machineCode}'
            AND NUMCAR < '2999'
            ORDER BY NUMPEC ASC`;
        var pointedCode = await (0, codeNote_1.codeNote)(odfNumber, Number(operationNumber), machineCode, funcionario);
        var oldTimer = new Date(pointedCode.time).getTime();
        var ripStartTime = Number(new Date().getTime() - oldTimer) || null;
    }
    catch (error) {
        console.log('Error on Rip --cookies--', error);
        return res.json({ message: '' });
    }
    try {
        var ripDetails = await (0, select_1.select)(rip);
    }
    catch (error) {
        console.log('Error on Rip Select', error);
        return res.json({ message: '' });
    }
    if (ripDetails.length <= 0) {
        response.message = 'Não há rip a mostrar';
        const insertedPointCode = await (0, insert_1.insertInto)(funcionario, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, ripStartTime);
        console.log('response', response);
        if (insertedPointCode) {
            return res.json(response);
        }
        else {
            return res.json({ message: '' });
        }
    }
    let arrayNumope = ripDetails.map((acc) => {
        if (acc.CST_NUMOPE === machineCode) {
            return acc;
        }
        else {
            return acc;
        }
    });
    let numopeFilter = arrayNumope.filter((acc) => acc);
    res.cookie('cstNumope', numopeFilter.map((acc) => acc.CST_NUMOPE));
    res.cookie('numCar', numopeFilter.map((acc) => acc.NUMCAR));
    res.cookie('descricao', numopeFilter.map((acc) => acc.DESCRICAO));
    res.cookie('especif', numopeFilter.map((acc) => acc.ESPECIF));
    res.cookie('instrumento', numopeFilter.map((acc) => acc.INSTRUMENTO));
    res.cookie('lie', numopeFilter.map((acc) => acc.LIE));
    res.cookie('lse', numopeFilter.map((acc) => acc.LSE));
    try {
        if (pointedCode.message === 'Pointed') {
            try {
                const inserted = await (0, insert_1.insertInto)(funcionario, odfNumber, partCode, revision, operationNumber.replaceAll(' ', ''), machineCode, maxQuantityReleased, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, ripStartTime);
                if (inserted) {
                    return res.json(numopeFilter);
                }
                else {
                    return response.message = '';
                }
            }
            catch (error) {
                console.log('Error on rip.ts', error);
                return response.message = '';
            }
        }
        else if (pointedCode.message === 'Rip iniciated') {
            return res.json(numopeFilter);
        }
        else {
            return res.json({ message: pointedCode.message });
        }
    }
    catch (error) {
        response.message = 'Erro ao iniciar tempo da rip';
        return res.json(response);
    }
};
exports.rip = rip;
//# sourceMappingURL=rip.js.map