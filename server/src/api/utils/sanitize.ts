import { message } from "../services/message";

export const sanitize = (input?: string | any) => {
    // console.log('input', input);

    if(typeof(input) === 'number'){
        console.log('input number', input);
        return input
    }
    if(typeof(input) === 'object'){
        return input
    }
    if (!input || input === '0' || input === '00' || input === '000' || input === '0000' || input === '00000' || input === '000000' || input === '0000000' || input === '00000000') {
        return message(33);
    }
    const allowedChars = /[A-Za-z0-9çÇ' '.-]/;
    return input && input.split('').map((char: string) => (allowedChars.test(char) ? char : '')).join('');
}