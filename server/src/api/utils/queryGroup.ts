export const selectedItensFromOdf = async (groupOdf: any, indexOdf: number) => {
    let response = {
        message: '',
        odf: '',
        odfBefore: '',
    }

    response.odfBefore = groupOdf[indexOdf - 1]
    response.odf = groupOdf[indexOdf]
    return response

    if (indexOdf <= 0) {
        if (groupOdf[indexOdf].QTDE_APONTADA >= groupOdf[indexOdf].QTDE_ODF) {
            return response.message = 'Não há limite na ODF'
        } else {
            groupOdf[indexOdf].QTDE_LIB = groupOdf[indexOdf].QTDE_ODF - groupOdf[indexOdf].QTDE_APONTADA
            return response
        }
    } else if (indexOdf > 0) {
        if (groupOdf[indexOdf].QTDE_APONTADA >= groupOdf[indexOdf - 1].QTD_BOAS || groupOdf[indexOdf].QTDE_APONTADA >= groupOdf[indexOdf].QTDE_ODF) {
            return response.message = 'Não há limite na ODF'
        } else {
            groupOdf[indexOdf].QTDE_LIB = groupOdf[indexOdf - 1].QTD_BOAS
            return response
        }
    } else {
        return null
    }
}