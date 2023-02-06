export const encoded = (numberOdf: string) => {
    let encodedOdfString = Buffer.from(numberOdf, 'utf-8').toString('hex')
    return encodedOdfString
}