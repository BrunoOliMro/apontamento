<script>
    export const preSanitize = (input) => {
        const allowedChars = /[0-9]/;
        const sanitizedOutput = input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
        return sanitizedOutput;
    }

    export const blockForbiddenChars = (e) => {
        let value = e.target.value;
        e.target.value = preSanitize(value);
    };
</script>
