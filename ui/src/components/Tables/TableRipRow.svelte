<script>
    // @ts-nocheck
    export let dados;
    export let indice;
    export let extraColumns;
    export let values;
    export let valuesObj = {
        LIE: dados.LIE,
        LSE: dados.LSE,
        setup: "",
        M2: "",
        M3: "",
        M4: "",
        M5: "",
        M6: "",
        M7: "",
        M8: "",
        M9: "",
        M10: "",
        M11: "",
        M12: "",
        M13: "",
    };
    export let setup = {};
    let id = "";

    function checkColor(event) {
        let userInputValue = event.target.value;
        let lie = dados.LIE;
        let lsd = dados.LSE;

        if (userInputValue < lie && userInputValue.length !== 0) {
            event.target.style.borderColor = "red";
        } else if (userInputValue > lsd && userInputValue.length !== 0) {
            event.target.style.borderColor = "red";
        } else if (
            userInputValue >= lie &&
            userInputValue <= lsd &&
            userInputValue.length !== 0
        ) {
            event.target.style.borderColor = "green";
        } else if (userInputValue.length === 0) {
            event.target.style.borderColor = "black";
        }
    }

    function target(event) {
        id = event.target.id;
        values = event.target.value;
        setup[id] = values;
    }

    function blockForbiddenChars(event) {
        event.target.value = preSanitize(event.target.value);
    }

    function preSanitize(input) {
        const allowedChars = /[A-Za-z0-9.,;´`]/;
        const sanitizedOutput = input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
        return sanitizedOutput;
    }
</script>

<tr class="tabelahistorico">
    <td>{indice}</td>
    <td>{dados.NUMPEC === null || !dados.NUMPEC ? "S/I" : dados.NUMPEC}</td>
    <td>{dados.DESCRICAO === null ? "S/I" : dados.DESCRICAO}</td>
    <td>{dados.ESPECIF === null || !dados.ESPECIF ? "S/I" : dados.ESPECIF}</td>
    <td id={"LIE-" + indice}>{dados.LIE === null ? "S/I" : dados.LIE}</td>
    <td id={"LSE-" + indice}>{dados.LSE === null ? "S/I" : dados.LSE}</td>
    <td>{dados.INSTRUMENTO === null ? "S/I" : dados.INSTRUMENTO}</td>
    <td
        ><input
            on:input={target}
            on:input={checkColor}
            on:input={blockForbiddenChars}
            bind:value={valuesObj["setup"]}
            onkeyup="this.value = this.value.toUpperCase()"
            id={"SETUP-" + indice}
            name={"SETUP-" + indice}
            type="text"
        /></td
    >
    <!-- <td> <input
            on:input={checkColor}
            on:input={target}
            onkeyup="this.value = this.value.toUpperCase()"
            id={"M2-" + indice}
            name={"M2-" + indice}
            type="text "
        /></td>
    <td
        ><input
            on:input={checkColor}
            onkeyup="this.value = this.value.toUpperCase()"
            on:input={target}
            id={"M3-" + indice}
            name={"M3-" + indice}
            type="text"
        /></td
    >
    <td
        ><input
            on:input={checkColor}
            onkeyup="this.value = this.value.toUpperCase()"
            on:input={target}
            id={"M4-" + indice}
            name={"M4-" + indice}
            type="text"
        /></td
    >
    <td
        ><input
            on:input={checkColor}
            onkeyup="this.value = this.value.toUpperCase()"
            on:input={target}
            id={"M5-" + indice}
            name={"M5-" + indice}
            type="text"
        /></td> -->

    {#each extraColumns as columnNumber}
        <td>
            <input
                on:input={checkColor}
                onkeyup="this.value = this.value.toUpperCase()"
                on:input={target}
                on:input={blockForbiddenChars}
                bind:value={valuesObj["M" + columnNumber]}
                id={"M" + columnNumber + "-" + indice}
                name={"M" + columnNumber + "-" + indice}
                type="text"
            />
        </td>
    {/each}
</tr>

<style>
    *:focus {
        outline: none;
    }
    .tabelahistorico {
        /* width: 100px; */
        background-color: white;
    }
    tr {
        background-color: white;
        text-align: center;
        letter-spacing: 1px;
    }
    td {
        /* width: 100%; */
        vertical-align: middle;
        align-items: center;
        background-color: white;
    }
    input {
        border-color: black;
        width: 80px;
        border-radius: 3px;
    }
</style>
