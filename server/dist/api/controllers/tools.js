"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedTools = exports.tools = void 0;
const pictures_1 = require("../pictures");
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const decodeOdf_1 = require("../utils/decodeOdf");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encodedOdf_1 = require("../utils/encodedOdf");
const sanitize_1 = require("../utils/sanitize");
const tools = async (req, res) => {
    if (!Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))))) {
        return res.json({ message: 'Algo deu errado' });
    }
    const decodedOdfNumber = Number((0, decodeOdf_1.decodedBuffer)(String((0, sanitize_1.sanitize)(req.cookies['encodedOdfNumber'])))) || 0;
    const numeroOdf = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])))) || 0;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    let numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
    const codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['employee']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const start = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["startSetupTime"])))) || 0;
    const qtdLibMax = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['quantidade'])))) || 0;
    const ferramenta = String("_ferr");
    const boas = 0;
    const ruins = 0;
    const codAponta = 1;
    const descricaoCodigoAponta = 'Ini Setup.';
    const faltante = 0;
    const retrabalhada = 0;
    const motivo = '';
    const lookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${codigoPeca}'`;
    let toolsImg;
    const result = [];
    if (numeroOdf !== decodedOdfNumber) {
        return res.json({ message: 'Erro na ODF' });
    }
    console.log("linha 49 /tools/");
    try {
        const inserted = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, start);
        if (inserted === 'Algo deu errado') {
            return res.json({ message: "Erro ao inserir codapontamento 1" });
        }
        else if (inserted === 'insert done') {
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
            return res.json({ message: 'Data not found' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "Erro ao inserir codapontamento 1" });
    }
};
exports.tools = tools;
const selectedTools = async (req, res) => {
    console.log("linha 91 /selectedTools.ts/");
    const numeroOdf = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || 0;
    const numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
    const codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['employee']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const qtdLibMax = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['quantidade'])))) || 0;
    console.log('linha 100 /tools/', qtdLibMax);
    const boas = 0;
    const ruins = 0;
    const codAponta = 2;
    const codAponta3 = 3;
    const descricaoCodigoAponta = 'Fin Setup.';
    const descricaoCodigoAponta3 = 'Ini Prod.';
    const faltante = 0;
    const retrabalhada = 0;
    const motivo = String('' || null);
    let x = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['startSetupTime']));
    let y = Number(new Date().getTime());
    const tempoDecorrido = Number(y - x) || 0;
    let z = (0, encodedOdf_1.encoded)(String(new Date().getTime()));
    console.log("linha 115");
    res.cookie("startProd", z);
    try {
        const codApontamentoFinalSetup = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido);
        console.log('linha 117', codApontamentoFinalSetup);
        if (codApontamentoFinalSetup === 'Algo deu errado') {
            return res.json({ message: 'Algo deu errado' });
        }
        else if (codApontamentoFinalSetup === 'insert done') {
            try {
                const codApontamentoInicioSetup = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || 0));
                console.log("linha 123", codApontamentoInicioSetup);
                if (codApontamentoInicioSetup === 'Algo deu errado') {
                    return res.json({ message: 'Algo deu errado' });
                }
                else if (codApontamentoInicioSetup === 'insert done') {
                    console.log("feer selecionadas");
                    return res.json({ message: 'ferramentas selecionadas com successo' });
                }
                else {
                    return res.json({ message: 'Algo deu errado' });
                }
            }
            catch (error) {
                return res.json({ message: 'Algo deu errado' });
            }
        }
        else {
            return res.json({ message: 'Algo deu errado' });
        }
    }
    catch (error) {
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.selectedTools = selectedTools;
//# sourceMappingURL=tools.js.map