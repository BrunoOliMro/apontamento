"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPost = void 0;
const insert_1 = require("../services/insert");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const stopPost = async (req, res) => {
    const odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const operationNumber = (0, decryptedOdf_1.decrypted)(String(req.cookies['NUMERO_OPERACAO'])) || null;
    const machineCode = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || null;
    const boas = 0;
    const faltante = 0;
    const retrabalhada = 0;
    const codAponta = 7;
    const ruins = 0;
    const motivo = '';
    const descricaoCodAponta = 'Parada';
    const end = new Date().getTime() || 0;
    const start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["startSetupTime"]))) || 0;
    const final = Number(end - start) || 0;
    const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode);
    if (x === 'Machine has stopped') {
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