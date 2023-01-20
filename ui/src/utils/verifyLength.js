import messageQuery from "./checkMessage";

export async function verifyStringLenght(event, string, lengthMin, lengthMax) {
    const response = {
        message : '',
    }

    if (string) {
        if ((event.key === "Enter" || event.type === 'click') && string.length < lengthMin || string.length >= lengthMax) {
            return response.message = 'Não atende aos requisitos de caracteres'
        } else if ((event.key === "Enter" || event.type === 'click') && string.length >= lengthMin && string.length < lengthMax) {
            if (string === '0' || string === '0' || string === '00' || string === '00' || string === '000' || string === '0000' || string === '00000' || string === '000000' || string === '0000000') {
                return response.message = 'Crachá inválido'
            } else {
                return response.message = messageQuery(1)
            }
        }
    }
}