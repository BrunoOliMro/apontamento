"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSupervisor = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const stopSupervisor = async (req, res) => {
    const supervisor = String((0, sanitize_html_1.default)(req.body['superSuperMaqPar'])) || null;
    console.log('linha 9 /stopSuper/');
    const numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['NUMERO_ODF']))) || null;
    const NUMERO_OPERACAO = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['NUMERO_OPERACAO']))) || null;
    const CODIGO_MAQUINA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    const qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['qtdLibMax']))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['employee']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['REVISAO']))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA']))) || null;
    console.log('linha 16 /stopsuper/');
    const boas = 0;
    const faltante = 0;
    const retrabalhada = 0;
    const ruins = 0;
    const codAponta = 3;
    const descricaoCodAponta = `Ini Prod.`;
    const motivo = '';
    const tempoDecorrido = 0;
    const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
    try {
        const resource = await (0, select_1.select)(lookForSupervisor);
        console.log('linha 28 /stopSupervisor/', resource);
        if (resource) {
            const insertTimerBackTo3 = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido);
            if (insertTimerBackTo3 === 'insert done') {
                return res.status(200).json({ message: 'maquina' });
            }
            else {
                return res.json({ message: "supervisor não encontrado" });
            }
        }
        else if (!resource) {
            return res.json({ message: "supervisor não encontrado" });
        }
        else {
            return res.json({ message: "supervisor não encontrado" });
        }
    }
    catch (error) {
        return res.json({ message: "erro na parada de maquina" });
    }
};
exports.stopSupervisor = stopSupervisor;
//# sourceMappingURL=stopSupervisor.js.map