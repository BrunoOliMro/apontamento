export const selectedItensFromOdf = async (groupOdf: any, indexOdf: number) => {
    let response = {
        message: '',
        odf: '',
        nextOdf: '',
        beforeOdf: '',
    }

    if (indexOdf <= 0) {
        response.message = 'Primeira ODF selecionada';
        response.beforeOdf = groupOdf[indexOdf]
        response.nextOdf = groupOdf[indexOdf + 1]
        response.odf = groupOdf[indexOdf]
        return response;
    } else if (indexOdf === groupOdf.length - 1) {
        response.message = 'Ultima ODF'
        response.odf = groupOdf[indexOdf - 1]
        response.nextOdf = groupOdf[indexOdf - 1]
        response.beforeOdf = groupOdf[indexOdf - 2]
        return response;
    } else if (indexOdf > 0 && indexOdf < groupOdf.length - 1) {
        response.message = 'Alguma ODF no meio'
        response.nextOdf = groupOdf[indexOdf + 1]
        response.beforeOdf = groupOdf[indexOdf - 1]
        response.odf = groupOdf[indexOdf]
        return response
    } else {
        return response.message = 'Algo deu errado';
    }
}