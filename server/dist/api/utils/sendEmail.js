"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewOrder = void 0;
const nodemailer = require('nodemailer');
const createNewOrder = async (odfNumber, operationNumber, machineCode, reworkFeed, missingFeed, goodFeed, badFeed, totalPointed, qtdOdf, clientCode, partCode) => {
    const account = {
        user: 'juniorlucaski@gmail.com',
        pass: 'veerpxepbazwaanw'
    };
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: account.user,
            pass: account.pass,
        },
    });
    const message = {
        from: 'juniorlucaski@gmail.com',
        to: 'juniorlucaski@gmail.com',
        subject: `Nova ordem`,
        text: `Criar nova ordem: \n numero_odf = ${odfNumber}
        \n Numero_operacao = ${operationNumber}
        \n Codigo_maquina = ${machineCode}
        \n Retrabalhadas = ${reworkFeed}
        \n Faltantes = ${missingFeed}
        \n Boas = ${goodFeed}
        \n Ruins = ${badFeed}
        \n Valor_apontado = ${totalPointed}
        \n Quantidade_total = ${qtdOdf} 
        \n Código_cliente = ${clientCode} 
        \n Codigo_peca = ${partCode} 
        `,
    };
    await transporter.sendMail(message);
};
exports.createNewOrder = createNewOrder;
//# sourceMappingURL=sendEmail.js.map