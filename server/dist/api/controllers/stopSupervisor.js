"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSupervisor = void 0;
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const stopSupervisor = async (req, res) => {
    try {
        var supervisor = String((0, sanitize_1.sanitize)(req.body['superSuperMaqPar'])) || null;
        var odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF']))) || null;
        var operationNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
        var machineCode = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
        var qtdLibMax = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['QTDE_LIB']))) || null;
        var funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        var revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
        var codigoPeca = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA']))) || null;
        var boas = null;
        var faltante = null;
        var retrabalhada = null;
        var ruins = null;
        var codAponta = 3;
        var descricaoCodAponta = `Ini Prod.`;
        var motivo = null;
        var tempoDecorrido = 0;
        var lookForSupervisor = `SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`;
    }
    catch (error) {
        console.log('Error on StopSupervisor --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, funcionario);
        if (pointedCode.message === 'Machine has stopped') {
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
            return res.json({ message: pointedCode });
        }
    }
    catch (error) {
        return res.json({ message: "erro na parada de maquina" });
    }
};
exports.stopSupervisor = stopSupervisor;
//# sourceMappingURL=stopSupervisor.js.map