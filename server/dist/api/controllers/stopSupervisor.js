"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSupervisor = void 0;
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const stopSupervisor = async (req, res) => {
    const supervisor = String((0, sanitize_1.sanitize)(req.body['superSuperMaqPar'])) || null;
    const odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF']))) || null;
    const operationNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
    const machineCode = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
    const boas = null;
    const faltante = null;
    const retrabalhada = null;
    const ruins = null;
    const codAponta = 3;
    const descricaoCodAponta = `Ini Prod.`;
    const motivo = null;
    const tempoDecorrido = 0;
    const lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
    try {
        const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, funcionario);
        if (x.message === 'Machine has stopped') {
            const resource = await (0, select_1.select)(lookForSupervisor);
            if (resource) {
                const insertTimerBackTo3 = await (0, insert_1.insertInto)(funcionario, odfNumber, codigoPeca, revisao, operationNumber, machineCode, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido);
                if (insertTimerBackTo3) {
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
        else {
            return res.json({ message: x });
        }
    }
    catch (error) {
        return res.json({ message: "erro na parada de maquina" });
    }
};
exports.stopSupervisor = stopSupervisor;
//# sourceMappingURL=stopSupervisor.js.map