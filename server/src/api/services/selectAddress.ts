import { selectQuery } from './query';
import { message } from './message';

export const selectAddress = async (codigoMaquina: string, comprimento: number, largura: number, peso: number, variables: any) => {
    const resultSelectPcpProg = await selectQuery(8, variables.cookies)
    const pecas = await selectQuery(3, variables.cookies)
    try {
        const values = {
            CODIGO_PECA: variables.cookies.CODIGO_PECA,
            comprimento: comprimento,
            largura: largura,
            peso: peso,
        }
        let data: any;
        if (codigoMaquina !== 'EX002') {
            data = await selectQuery(33, values)
            if (data) {
                data = await selectQuery(34, values)
            }
        } else if (codigoMaquina === 'EX002') {
            data = await selectQuery(35, values)
            console.log('data 7 = ex002', data);
            if (data) {
                console.log('data 7 = ex002', data);
                data = await selectQuery(36, values)
            }
        }

        const composicaoDeEstoque = await selectQuery(4, data[0])

        const array = []
        if (pecas![0].EXECUT * resultSelectPcpProg![0].QTD_BOAS! > composicaoDeEstoque![0].PESO) {
            peso = composicaoDeEstoque![0].PESO
            array.push(false)
        }
        else if (pecas![0].COMPRIMENTO > composicaoDeEstoque![0].COMPRIMENTO) {
            comprimento = composicaoDeEstoque![0].COMPRIMENTO
            array.push(false)
        }
        else if (pecas![0].LARGURA > composicaoDeEstoque![0].LARGURA) {
            largura = composicaoDeEstoque![0].LARGURA
            array.push(false)
        }
        else if (pecas![0].COMPRIMENTO + pecas![0].LARGURA > composicaoDeEstoque![0].COMPRIMENTO + composicaoDeEstoque![0].LARGURA) {
            array.push(false)
        }
        else if (pecas![0].COMPRIMENTO * pecas![0].LARGURA * variables.cookies.QTDE_LIB! > composicaoDeEstoque![0].COMPRIMENTO * composicaoDeEstoque![0].LARGURA * composicaoDeEstoque![0].ALTURA) {
            array.push(false)
        }
        else if (composicaoDeEstoque![0].COMPRIMENTO * composicaoDeEstoque![0].LARGURA < pecas![0].COMPRIMENTO * pecas![0].LARGURA) {
            array.push(false)
        }

        array.filter(async (element: boolean) => {
            if (element === false) {
                data = await selectAddress(variables.cookies.CODIGO_MAQUINA, comprimento, largura, peso, variables);
            }
        })

        console.log('data', data);
        return data

    } catch (err) {
        console.log('err in select address ', err);
        return message(33)
    }
}