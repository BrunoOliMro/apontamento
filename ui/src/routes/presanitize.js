export default function blockForbiddenChars (e) {
    e.target.value = preSanitize(e.target.value);
};

const preSanitize = (input) => {
    const allowedChars = /[0-9]/;
    const sanitizedOutput = input
        .split("")
        .map((char) => (allowedChars.test(char) ? char : ""))
        .join("");
    return sanitizedOutput;
};
