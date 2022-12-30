export const sanitize = (input?: string | any) => {
    let message;
    if (!input || input === '0' || input === '00' || input === '000' || input === '0000' || input === '00000' || input === '000000' || input === '0000000' || input === '00000000') {
        return message = '';
    }
    const allowedChars = /[A-Za-z0-9' '.-]/;
    return input && input.split('').map((char: string) => (allowedChars.test(char) ? char : '')).join('');
}