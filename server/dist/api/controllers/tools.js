"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedTools = exports.tools = void 0;
const pictures_1 = require("../pictures");
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decodeOdf_1 = require("../utils/decodeOdf");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const tools = async (req, res) => {
    try {
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"])))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"])))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"])))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO'])))) || null;
        var startSetupTime = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["startSetupTime"])))) || null;
        var maxQuantityReleased = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
        var toolString = String("_ferr");
        var goodFeed = null;
        var badFeed = null;
        var pointedCode = [1];
        var missingFeed = null;
        var reworkFeed = null;
        var pointedCodeDescription = 'Ini Setup.';
        var motives = null;
        var stringLookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${partCode}'`;
        var toolsImg;
        var result = [];
        if (odfNumber !== Number((0, decodeOdf_1.decodedBuffer)(String((0, sanitize_1.sanitize)(req.cookies['encodedOdfNumber'])))) || null) {
            return res.json({ message: 'Algo deu errado' });
        }
    }
    catch (error) {
        console.log('Error on Tools --cookies', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const codeNoteResult = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, employee);
        if (codeNoteResult.message === 'First time acessing ODF' || codeNoteResult.message === 'Begin new process') {
            const inserted = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, String(operationNumber), machineCode, maxQuantityReleased, goodFeed, badFeed, pointedCode, pointedCodeDescription, motives, missingFeed, reworkFeed, startSetupTime);
            if (inserted === 'Success') {
                try {
                    toolsImg = await (0, select_1.select)(stringLookForTools);
                    if (toolsImg.length <= 0) {
                        return res.json({ message: "/images/sem_imagem.gif" });
                    }
                    if (toolsImg.length > 0) {
                        for await (const [i, record] of toolsImg.entries()) {
                            const rec = await record;
                            const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], toolString, String(i));
                            result.push(path);
                        }
                        return res.json(result);
                    }
                    else {
                        return res.json({ message: "/images/sem_imagem.gif" });
                    }
                }
                catch (error) {
                    console.log(error);
                    return res.json({ message: 'Not found' });
                }
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else {
            return res.json({ message: codeNoteResult.message });
        }
    }
    catch (error) {
        console.log('Error on tools ', error);
        return res.json({ message: "Algo deu errado" });
    }
};
exports.tools = tools;
const selectedTools = async (req, res) => {
    try {
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var operationNumber = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO'])))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"])))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO'])))) || null;
        var maxQuantityReleased = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
        var boas = null;
        var ruins = null;
        var pointCodeSetupEnded = [2];
        var pointCodeIniciatedProd = [3];
        var pointCodeEndSetup = 'Fin Setup';
        var pointCodeProdIniciated = 'Ini Prod.';
        var missingFeed = null;
        var reworkFeed = null;
        var motive = null;
        var startSetupTime = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['startSetupTime']))) || null;
        let startProd = await (0, encryptOdf_1.encrypted)(String(new Date().getTime()));
        res.cookie("startProd", startProd);
    }
    catch (error) {
        console.log('Error on SelectedTools --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    const tempoDecorrido = Number(Number(new Date().getTime()) - startSetupTime) || 0;
    try {
        const codeNoteResult = await (0, codeNote_1.codeNote)(odfNumber, Number(operationNumber), machineCode, employee);
        if (codeNoteResult.message === 'Pointed Iniciated') {
            const codApontamentoFinalSetup = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, boas, ruins, pointCodeSetupEnded, pointCodeEndSetup, motive, missingFeed, reworkFeed, tempoDecorrido);
            if (codApontamentoFinalSetup !== 'Algo deu errado') {
                const codApontamentoInicioSetup = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, boas, ruins, pointCodeIniciatedProd, pointCodeProdIniciated, motive, missingFeed, reworkFeed, Number(new Date().getTime() || null));
                if (codApontamentoInicioSetup !== 'Algo deu errado') {
                    return res.json({ message: 'Success' });
                }
                else {
                    return res.json({ message: 'Algo deu errado' });
                }
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else if (codeNoteResult.message === 'Fin Setup') {
            const codApontamentoInicioSetup = await (0, insert_1.insertInto)(employee, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, boas, ruins, pointCodeIniciatedProd, pointCodeProdIniciated, motive, missingFeed, reworkFeed, Number(new Date().getTime() || null));
            if (codApontamentoInicioSetup) {
                return res.json({ message: 'Success' });
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else {
            return res.json({ message: codeNoteResult.message });
        }
    }
    catch (error) {
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.selectedTools = selectedTools;
//# sourceMappingURL=tools.js.map