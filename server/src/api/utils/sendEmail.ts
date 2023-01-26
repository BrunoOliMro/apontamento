const nodemailer = require('nodemailer');

export const createNewOrder: any = async (odfNumber: number | 'S/I', operationNumber: number | 'S/I', machineCode: string | 'S/I', reworkFeed: number | 'S/I', missingFeed: number | 'S/I', goodFeed: number | 'S/I', badFeed: number | 'S/I', totalPointed: number | 'S/I', qtdOdf: number | 'S/I', clientCode: string | 'S/I', partCode: string | 'S/I') => {
    // const account = {
    //     user: 'cim@martiaco.com.br',
    //     pass: 'Muc86421'
    // };

    const account = {
        user: 'juniorlucaski@gmail.com',
        pass: 'veerpxepbazwaanw'
    };


    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass, // generated ethereal password
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

    await transporter.sendMail(message)
}