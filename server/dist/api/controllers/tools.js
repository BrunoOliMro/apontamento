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
        var numeroOdf = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])))) || null;
        var codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
        var numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
        var codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
        var funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        var revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
        var start = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["startSetupTime"])))) || null;
        var qtdLibMax = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
        var ferramenta = String("_ferr");
        var boas = null;
        var ruins = null;
        var codAponta = [1];
        var descricaoCodigoAponta = 'Ini Setup.';
        var faltante = null;
        var retrabalhada = null;
        var motivo = null;
        var lookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${codigoPeca}'`;
        var toolsImg;
        var result = [];
        if (numeroOdf !== Number((0, decodeOdf_1.decodedBuffer)(String((0, sanitize_1.sanitize)(req.cookies['encodedOdfNumber']))))) {
            console.log('ODF Verificada com falha');
            return res.json({ message: 'Erro na ODF' });
        }
    }
    catch (error) {
        console.log('Error on Tools --cookies', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const codeNoteResult = await (0, codeNote_1.codeNote)(numeroOdf, numeroOperacao, codigoMaq, funcionario);
        if (codeNoteResult.message === 'First time acessing ODF' || codeNoteResult.message === 'Begin new process') {
            const inserted = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, start);
            if (inserted !== 'Algo deu errado') {
                try {
                    toolsImg = await (0, select_1.select)(lookForTools);
                    if (toolsImg.length <= 0) {
                        return res.json({ message: "/images/sem_imagem.gif" });
                    }
                    if (toolsImg.length > 0) {
                        for await (const [i, record] of toolsImg.entries()) {
                            const rec = await record;
                            const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
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
                    return res.json({ message: 'Data not found' });
                }
            }
            else {
                return res.json({ message: 'Something went wrong' });
            }
        }
        else {
            return res.json({ message: codeNoteResult.message });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "Erro ao inserir codapontamento 1" });
    }
};
exports.tools = tools;
const selectedTools = async (req, res) => {
    try {
        var numeroOdf = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
        var codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
        var codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
        var funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        var revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
        var qtdLibMax = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
        var boas = null;
        var ruins = null;
        var codAponta = [2];
        var codAponta3 = [3];
        var descricaoCodigoAponta = 'Fin Setup.';
        var descricaoCodigoAponta3 = 'Ini Prod.';
        var faltante = null;
        var retrabalhada = null;
        var motivo = null;
        var startSetupTime = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['startSetupTime'])) || null;
    }
    catch (error) {
        console.log('Error on SelectedTools --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    const tempoDecorrido = Number(Number(new Date().getTime()) - startSetupTime) || 0;
    let startProd = await (0, encryptOdf_1.encrypted)(String(new Date().getTime()));
    res.cookie("startProd", startProd);
    try {
        const codeNoteResult = await (0, codeNote_1.codeNote)(numeroOdf, numeroOperacao, codigoMaq, funcionario);
        if (codeNoteResult.message === 'Pointed Iniciated') {
            const codApontamentoFinalSetup = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido);
            if (codApontamentoFinalSetup !== 'Algo deu errado') {
                const codApontamentoInicioSetup = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || null));
                if (codApontamentoInicioSetup !== 'Algo deu errado') {
                    return res.json({ message: 'ferramentas selecionadas com successo' });
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
            const codApontamentoInicioSetup = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || null));
            if (codApontamentoInicioSetup) {
                return res.json({ message: 'ferramentas selecionadas com successo' });
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