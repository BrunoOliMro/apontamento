"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectedTools = exports.tools = void 0;
const pictures_1 = require("../pictures");
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const decodeOdf_1 = require("../utils/decodeOdf");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const tools = async (req, res, next) => {
    if (req.cookies['NUMERO_ODF'] === undefined) {
        console.log("algo deu errado linha 17 /tools/");
        return res.json({ message: 'Algo deu errado' });
    }
    let decodedOdfNumber = (0, decodeOdf_1.decodedBuffer)(String((0, sanitize_1.sanitize)(req.cookies['encodedOdfNumber']))) || null;
    let numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    let numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
    let codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    let start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["starterBarcode"]))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['qtdLibMax']))) || null;
    let startTime;
    startTime = Number(start);
    let ferramenta = String("_ferr");
    const boas = 0;
    const ruins = 0;
    const codAponta = 1;
    const descricaoCodigoAponta = 'Ini Setup.';
    const faltante = 0;
    let retrabalhada = 0;
    const motivo = '';
    let lookForTools = `SELECT [CODIGO], [IMAGEM] FROM VIEW_APTO_FERRAMENTAL WHERE 1 = 1 AND IMAGEM IS NOT NULL AND CODIGO = '${codigoPeca}'`;
    console.log("linha 41", decodedOdfNumber);
    if (numeroOdf !== decodedOdfNumber) {
        return res.json({ message: 'Erro na ODF' });
    }
    numeroOdf = Number(numeroOdf);
    qtdLibMax = Number(qtdLibMax);
    try {
        let toolsImg;
        try {
            console.log("linha 55 /tools/");
            toolsImg = await (0, select_1.select)(lookForTools);
            await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, startTime);
            console.log("linha 58 /tools/");
        }
        catch (error) {
            console.log(error);
            return res.json({ message: "Erro ao inserir codapontamento 1" });
        }
        if (toolsImg === 'Data not found') {
            return res.json({ message: 'Data not found' });
        }
        console.log("linha 53 /tools/", toolsImg);
        let result = [];
        for await (let [i, record] of toolsImg.entries()) {
            console.log("linha 57 /tools/ ");
            const rec = await record;
            const path = await pictures_1.pictures.getPicturePath(rec["CODIGO"], rec["IMAGEM"], ferramenta, String(i));
            result.push(path);
        }
        console.log("linha 61 /tools/");
        if (toolsImg.length <= 0) {
            return res.json({ message: "/images/sem_imagem.gif" });
        }
        if (toolsImg.length > 0) {
            res.cookie('tools', 'true');
            return res.json(result);
        }
        else {
            next();
        }
    }
    catch (error) {
        return res.json({ error: true, message: "Erro ao tentar acessar as fotos de ferramentas" });
    }
    finally {
    }
};
exports.tools = tools;
const selectedTools = async (req, res) => {
    let numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF']))) || null;
    numeroOdf = Number(numeroOdf);
    const numeroOperacao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
    const codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['qtdLibMax']))) || null;
    qtdLibMax = Number(qtdLibMax);
    let start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['starterBarcode']))) || null;
    const boas = 0;
    const ruins = 0;
    const codAponta = 2;
    const codAponta3 = 3;
    const descricaoCodigoAponta = 'Fin Setup.';
    let descricaoCodigoAponta3 = 'Ini Prod.';
    const faltante = 0;
    let retrabalhada = 0;
    const motivo = String('' || null);
    const end = Number(new Date().getTime()) || 0;
    let startTime;
    startTime = Number(start);
    let tempoDecorrido = String(end - startTime || 0);
    String(tempoDecorrido);
    let startProd = Number(new Date().getTime() || 0);
    start = (0, encryptOdf_1.encrypted)(start);
    res.cookie("startProd", startProd);
    try {
        console.log("linha 143 /selected tools/");
        (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, startProd);
        (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, startProd);
        console.log("linha 149 /selected tools/");
        return res.json({ message: 'ferramentas selecionadas com successo' });
    }
    catch (error) {
        console.log('linha 104 /selected Tools/: ', error);
        return res.redirect("/#/ferramenta");
    }
    finally {
    }
};
exports.selectedTools = selectedTools;
//# sourceMappingURL=tools.js.map