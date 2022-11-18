"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSupervisor = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const stopSupervisor = async (req, res) => {
    let supervisor = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.body['superSuperMaqPar']))) || null;
    let numeroOdf = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['NUMERO_ODF']))) || null;
    let NUMERO_OPERACAO = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['NUMERO_OPERACAO']))) || null;
    let CODIGO_MAQUINA = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
    let qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['qtdLibMax']))) || null;
    let funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO']))) || null;
    let revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['REVISAO']))) || null;
    let codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_PECA']))) || null;
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        let boas = 0;
        let faltante = 0;
        let retrabalhada = 0;
        let ruins = 0;
        let codAponta = 3;
        let descricaoCodAponta = `Ini Prod.`;
        let motivo = '';
        let tempoDecorrido = 0;
        let table = `VIEW_GRUPO_APT`;
        let top = `TOP 1`;
        let column = `CRACHA`;
        let where = `AND CRACHA = '${supervisor}'`;
        let orderBy = ``;
        const resource = await (0, select_1.select)(table, top, column, where, orderBy);
        if (resource.length > 0) {
            await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, NUMERO_OPERACAO, CODIGO_MAQUINA, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido);
            return res.status(200).json({ message: 'maquina' });
        }
        else {
            return res.json({ message: "supervisor não encontrado" });
        }
    }
    catch (error) {
        return res.json({ message: "erro na parada de maquina" });
    }
    finally {
    }
};
exports.stopSupervisor = stopSupervisor;
//# sourceMappingURL=stopSupervisor.js.map