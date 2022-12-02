"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPost = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const insert_1 = require("../services/insert");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const stopPost = async (req, res) => {
    const numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"]))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['employee']))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['REVISAO']))) || null;
    const numeroOperacao = (0, decryptedOdf_1.decrypted)(String(req.cookies['NUMERO_OPERACAO'])) || null;
    const codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    const qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['quantidade']))) || null;
    const boas = 0;
    const faltante = 0;
    const retrabalhada = 0;
    const codAponta = 7;
    const ruins = 0;
    const motivo = '';
    const descricaoCodAponta = 'Parada';
    const end = new Date().getTime() || 0;
    const start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["startSetupTime"]))) || 0;
    const final = Number(end - start) || 0;
    try {
        const resour = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, final);
        console.log("parada", resour);
        if (resour === 'insert done') {
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
};
exports.stopPost = stopPost;
//# sourceMappingURL=stopPost.js.map