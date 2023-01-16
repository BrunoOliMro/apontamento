export default function messageQuery(numberString) {
    let response;
    const query = {
        0: '',
        1: 'Success',
        2: 'Failed',
        3: 'Error',
        4: 'Algo deu errado',
        5: "Not found",
        6: "Crachá não encontrado",
        7: "Crachá inválido",
        8: "Não atende aos requisitos de caracteres",
        9: "Ini Prod",
        10: "Pointed",
        11: "Rip iniciated",
        12: "Begin new process",
        13: "Pointed Iniciated",
        14: "Fin Setup",
        15: "A value was returned",
        16: "Machine has stopped",
        17: "/#/codigobarras/apontamento",
        18: "/#/rip",
        19: "/#/ferramenta",
        20: "/#/codigobarras/",
        21: "Relatorio de processos está vazia",
        22: "Não há rip a mostrar",
        23: "Preencha todos os campos",
        24: "Supervisor needed",
        25: "Supervisor inválido",
        26: "Crachá inválido",
        27: "Ini Prod",
        28: "Pointed Iniciated",
        29: "Fin Setup",
        30: "/images/sem_imagem.gif",
        31: "A value was returned",
        32: "Sem ferramentas",
        33: "Erro ao tentar acessar as fotos de ferramentas",
        34: "Supervisor encontrado",
        35: 'No address',
        36: 'Não há limite na ODF',
        37: 'Sem cookies',
        38: 'ODF finalizada',
        39: 'ODF apontada',
    }

    Object.entries(query).forEach(element => {
        if (Number(element[0]) === numberString) {
            response = element[1]
        }
    })

    return response
}