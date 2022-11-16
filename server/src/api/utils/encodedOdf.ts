export const encodedOdfString = (numeroOdf: string) => {
    let encodedOdfString = Buffer.from(numeroOdf, 'utf-8').toString('hex')
    return encodedOdfString
}