"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odfData = void 0;
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const odfIndex_1 = require("../utils/odfIndex");
const sanitize_1 = require("../utils/sanitize");
const odfData = async (req, res) => {
    const response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
    };
    try {
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])))) || null;
        var operationNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
        var codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
        var numOper = "00" + (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))).replaceAll(' ', '0') || null;
        var funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
        var lookForOdfData = `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    }
    catch (error) {
        console.log('error on cookies', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine, funcionario);
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const data = await (0, select_1.select)(lookForOdfData);
            const i = await (0, odfIndex_1.odfIndex)(data, numOper);
            response.odfSelecionada = data[i];
            response.funcionario = funcionario;
            if (response.message === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' });
            }
            else {
                response.message = 'Tudo certo por aqui /OdfData.ts/';
                return res.status(200).json(response);
            }
        }
        else {
            return res.json({ message: pointedCode });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "Algo deu errado" });
    }
};
exports.odfData = odfData;
//# sourceMappingURL=odfData.js.map