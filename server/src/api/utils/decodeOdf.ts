export const decodedBuffer = (encodedOdfString: string) => {
    let decodedBuffer = Buffer.from(encodedOdfString, 'hex').toString('utf-8')
    return decodedBuffer
}