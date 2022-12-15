"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPost = void 0;
const insert_1 = require("../services/insert");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const stopPost = async (req, res) => {
    try {
        var odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
        var funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        var codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
        var revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
        var operationNumber = (0, decryptedOdf_1.decrypted)(String(req.cookies['NUMERO_OPERACAO'])) || null;
        var machineCode = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
        var qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || null;
        var boas = null;
        var faltante = null;
        var retrabalhada = null;
        var codAponta = 7;
        var ruins = null;
        var motivo = '';
        var descricaoCodAponta = 'Parada';
        var end = new Date().getTime() || 0;
        var start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["startSetupTime"]))) || 0;
        var final = Number(end - start) || 0;
    }
    catch (error) {
        console.log('Error on stopPost --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        var pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, funcionario);
    }
    catch (error) {
        console.log('Error on StopPost --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    if (pointedCode.message === 'Machine has stopped') {
        return res.json({ message: 'Máquina já parada' });
    }
    else {
        try {
            const resour = await (0, insert_1.insertInto)(funcionario, odfNumber, codigoPeca, revisao, operationNumber, machineCode, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, final);
            if (resour) {
                return res.status(200).json({ message: 'maquina parada com sucesso' });
            }
            else if (resour === 'Algo deu errado') {
                return res.json({ message: 'erro ao parar a maquina' });
            }
            else {
                return res.json({ message: 'erro ao parar a maquina' });
            }
        }
        catch (error) {
            console.log(error);
            return res.json({ message: "ocorre um erro ao tentar parar a maquina" });
        }
    }
};
exports.stopPost = stopPost;
//# sourceMappingURL=stopPost.js.map