export const message = (choosenOption: number) => {
    const response: any = {
        0: 'Algo deu errado',
        1: 'Success',
        2: 'Ocorreu um erro, tente novamente...',
        4: 'Crachá não encontrado',
        5: 'ODF apontada',
        6: 'ODF não encontrada',
        7: 'Código de barras inválido',
        8: 'Código de barras está vazio',
        9: 'Funcionário inválido',
        10: 'Algo deu errado',
        11: 'Não há limite na ODF',
        12: 'Quantidade para reserva inválida',
        13: 'Não há item para reservar',
        14: 'Valores Reservados',
        15: 'Gerar cookies',
        16: "/images/sem_imagem.gif",
        17: 'Not found',
        18: 'Erro ao acessar os cookies',
        19: 'Máquina já parada',
        20: 'Machine has stopped',
        21: 'Supervisor not found',
        22: 'Supervisor found',
        23: 'A value was returned',
        24: 'Begin new process',
        25: 'Finalize o processo para estornar',
        26: 'Não foi indicado boas e ruins',
        27: 'Sem limite para estorno',
        28: 'ODF não pode ser estornada',
        29: 'Invalid ODF',
        31: 'Estornado',
        32: 'No address',
        33: '',
        34: 'Exibir histórico',
        35: 'insert done',
        36: '',
        37: 'Error on update',
        38: 'Pointed Iniciated',
        39: 'Fin Setup',
        40: 'First time acessing ODF',
        41: 'Ini Prod',
        42: 'Não há rip a mostrar',
        43: 'Não pode ser devolvido',
        44: 'Failure',
        45: 'Sem ferramentas',
        46: '5A01A01-11',
        47: 'Sem cookies', 
        48: 'Preencha todos os campos', 
    }

    for (const key in response) {
        if (choosenOption === Number(key)) {
            var answer = response[key]
        }
    }

    return answer
}