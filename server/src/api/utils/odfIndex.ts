export const odfIndex: any | number = async (array: any, numOper: string | any) => {
    console.log("linha 2 /odfIndex/", array);
    let indexNumber = Number(array
        .map((element: any) => element.NUMERO_OPERACAO)
        .map((value: string) => '00' + value)
        .toString()
        .replaceAll(' ', '0')
        .split(',')
        .findIndex((callback: string) => callback === numOper))

    return indexNumber
}