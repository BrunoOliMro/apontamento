import { message } from "../services/message"

export function unravelBarcode(obj: any) {
    let response: any = {
        message: '',
        data: {
            NUMERO_ODF: '',
            NUMERO_OPERACAO: '',
            CODIGO_MAQUINA: '',
            FUNCIONARIO: '',
            QTDE_LIB: 0,
            CODIGO_PECA: '',
        },
    }

    // if (!obj.barcode || obj.barcode.length <= 16 || obj.barcode.length > 18) {
    //     console.log('neigbreibribnr');
    //     return response.message = ''
    // }
    console.log('obj in unravel', obj);

    //Reatribuiu o codigo caso o cado de barras seja maior
    const dados: any = {
        numOdf: String(obj!.slice(10)),
        numOper: String(obj!.slice(0, 5)),
        codMaq: String(obj!.slice(5, 10)),
    }

    if (obj.length > 17) {
        dados.numOdf = obj!.slice(11)
        dados.numOper = obj!.slice(0, 5)
        dados.codMaq = obj!.slice(5, 11)
    }
    response.message = message(1)
    response.data.NUMERO_ODF = dados.numOdf
    response.data.NUMERO_OPERACAO = dados.numOper
    response.data.CODIGO_MAQUINA = dados.codMaq
    return response
}


