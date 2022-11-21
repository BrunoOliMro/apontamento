"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPost = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const stopPost = async (req, res) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["NUMERO_ODF"]))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO']))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA']))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['REVISAO']))) || null;
    let numeroOperacao = (0, decryptedOdf_1.decrypted)(String(req.cookies['NUMERO_OPERACAO'])) || null;
    let codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['qtdLibMax']))) || null;
    let end = new Date().getTime() || 0;
    let start = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies["starterBarcode"]))) || 0;
    let newStart;
    newStart = Number(start);
    let final = Number(end - newStart) || 0;
    console.log("linha 25 /stop post/");
    let boas = 0;
    let faltante = 0;
    let retrabalhada = 0;
    let codAponta = 7;
    let ruins = 0;
    let motivo = '';
    let descricaoCodAponta = 'Parada';
    try {
        const resour = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, final);
        console.log("parada", resour);
        if (resour) {
            return res.status(200).json({ message: 'maquina parada com sucesso' });
        }
        else {
            return res.json({ message: 'erro ao parar a maquina' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "ocorre um erro ao tentar parar a maquina" });
    }
    finally {
        await connection.close();
    }
};
exports.stopPost = stopPost;
//# sourceMappingURL=stopPost.js.map