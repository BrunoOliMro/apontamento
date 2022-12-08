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
    if (!Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))))) {
        return res.json({ message: 'Algo deu errado' });
    }
    const numeroOdf = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    let numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
    const codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const start = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["startSetupTime"])))) || null;
    const qtdLibMax = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
    const ferramenta = String("_ferr");
    const boas = null;
    const ruins = null;
    const codAponta = 1;
    const descricaoCodigoAponta = 'Ini Setup.';
    const faltante = null;
    const retrabalhada = null;
    const motivo = null;
    const lookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${codigoPeca}'`;
    let toolsImg;
    const result = [];
    if (numeroOdf !== Number((0, decodeOdf_1.decodedBuffer)(String((0, sanitize_1.sanitize)(req.cookies['encodedOdfNumber']))))) {
        console.log('ODF Verificada com falha');
        return res.json({ message: 'Erro na ODF' });
    }
    try {
        const codeNoteResult = await (0, codeNote_1.codeNote)(numeroOdf, numeroOperacao, codigoMaq);
        if (codeNoteResult === 'First time acessing ODF' || codeNoteResult === 'Begin new process') {
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
                        const obj = {
                            message: 'codeApont 1 inserido',
                            result: result,
                        };
                        return res.json(obj);
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
            return res.json({ message: codeNoteResult });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "Erro ao inserir codapontamento 1" });
    }
};
exports.tools = tools;
const selectedTools = async (req, res) => {
    const numeroOdf = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
    const numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
    const codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const qtdLibMax = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB'])))) || null;
    const boas = null;
    const ruins = null;
    const codAponta = 2;
    const codAponta3 = 3;
    const descricaoCodigoAponta = 'Fin Setup.';
    const descricaoCodigoAponta3 = 'Ini Prod.';
    const faltante = null;
    const retrabalhada = null;
    const motivo = null;
    let x = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['startSetupTime'])) || null;
    let y = Number(new Date().getTime());
    const tempoDecorrido = Number(y - x) || 0;
    let z = await (0, encryptOdf_1.encrypted)(String(new Date().getTime()));
    res.cookie("startProd", z);
    try {
        const codeNoteResult = await (0, codeNote_1.codeNote)(numeroOdf, numeroOperacao, codigoMaq);
        if (codeNoteResult === 'Pointed Iniciated') {
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
        else if (codeNoteResult === 'Fin Setup') {
            const codApontamentoInicioSetup = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || null));
            if (codApontamentoInicioSetup) {
                return res.json({ message: 'ferramentas selecionadas com successo' });
            }
            else {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else {
            return res.json({ message: codeNoteResult });
        }
    }
    catch (error) {
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.selectedTools = selectedTools;
//# sourceMappingURL=tools.js.map