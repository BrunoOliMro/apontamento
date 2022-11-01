export const selectDrawing = (numpec: string, revisao: string) => {
    const queryDrawing = `
    SELECT
    DISTINCT
        [NUMPEC],
        [IMAGEM],
        [REVISAO]
    FROM  QA_LAYOUT(NOLOCK) 
    WHERE 1 = 1 
        AND NUMPEC = '${numpec}'
        AND REVISAO = ${revisao}
        AND IMAGEM IS NOT NULL`
    return queryDrawing
}