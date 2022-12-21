export const sanitize = (input?: string | any) => {
    const allowedChars = /[A-Za-z0-9' '.-]/;
    return input && input.split('').map((char: string) => (allowedChars.test(char) ? char : '')).join('');
}