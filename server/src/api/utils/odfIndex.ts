export const odfIndex: any | number = async (array: any, numOper: string | any) => {
    let indexNumber = Number(array
        .map((element: any) => element.NUMERO_OPERACAO)
        .map((value: string) => '00' + value)
        .toString()
        .replaceAll(' ', '0')
        .split(',')
        .findIndex((callback: string) => callback === numOper))
    return indexNumber
}