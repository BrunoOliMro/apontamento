import { message } from "./message";
import { selectQuery } from "./query"

export const sequenciamentoView =  async (variables: any) => {
    const data = await selectQuery(32, variables);
    console.log('variablessss', variables);
    console.log('data', data.data![0].CODIGO_MAQUINA);
    variables.CODIGO_MAQUINA

    if(variables.CODIGO_MAQUINA !== data.data![0].CODIGO_MAQUINA){
        return {data, message: message(33), machine: data.data![0].CODIGO_MAQUINA }
    } else {
        return {data , message: message(1)}
    }
}