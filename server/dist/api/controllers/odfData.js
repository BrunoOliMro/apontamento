"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odfData = void 0;
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const odfIndex_1 = require("../utils/odfIndex");
const sanitize_1 = require("../utils/sanitize");
const odfData = async (req, res) => {
    const odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"])))) || null;
    let operationNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))) || null;
    let codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_MAQUINA"]))) || null;
    const numOper = "00" + (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_OPERACAO"]))).replaceAll(' ', '0') || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const lookForOdfData = `SELECT CODIGO_CLIENTE, REVISAO, NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_APONTADA, QTDE_LIB,  QTD_REFUGO, CODIGO_PECA, HORA_FIM, HORA_INICIO, DT_INICIO_OP, DT_FIM_OP, QTD_BOAS FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO (NOLOCK) WHERE 1 = 1 AND NUMERO_ODF = ${odfNumber} AND CODIGO_PECA IS NOT NULL ORDER BY NUMERO_OPERACAO ASC`;
    const qtdeLib = Number((0, decryptedOdf_1.decrypted)(req.cookies['QTDE_LIB']));
    const response = {
        message: '',
        funcionario: funcionario,
        odfSelecionada: '',
    };
    try {
        if (!funcionario) {
            return res.json({ message: 'Algo deu errado' });
        }
        if (!qtdeLib) {
            return res.json({ message: 'Algo deu errado' });
        }
        const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine, funcionario);
        console.log('linha 29 /odfData/', x);
        if (x.message === 'Ini Prod' || x.message === 'Pointed' || x.message === 'Rip iniciated' || x.message === 'Machine has stopped') {
            const data = await (0, select_1.select)(lookForOdfData);
            const i = await (0, odfIndex_1.odfIndex)(data, numOper);
            response.odfSelecionada = data[i];
            if (response.message === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' });
            }
            else {
                response.message = 'Tudo certo por aqui /OdfData.ts/';
                return res.status(200).json(response);
            }
        }
        else {
            return res.json({ message: x });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: "Algo deu errado" });
    }
};
exports.odfData = odfData;
//# sourceMappingURL=odfData.js.map