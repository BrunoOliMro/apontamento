<script>
    export let dados;
    export let indice;
    export let extraColumns;
    let idInput = "M" + indice;
    let value = "";

    function checkColor(i) {
        let userInput = "";
        //     // @ts-ignore
        //     let userInput = document.getElementById(i).value;

        //     console.log("user: linha 111", userInput);
        //     //let userInputI = document.querySelectorAll("[name*=M]");
        let lie = dados.LIE;
        let lsd = dados.LSE;

        //     userInput = blockForbiddenChars();
        //     console.log("userInput: linha 17", userInput);

        if (userInput < lie && userInput.length !== 0) {
            document.getElementById(i).style.borderColor = "red";
        } else if (userInput > lsd && userInput.length !== 0) {
            document.getElementById(i).style.borderColor = "red";
        } else if (
            userInput >= lie &&
            userInput <= lsd &&
            userInput.length !== 0
        ) {
            document.getElementById(i).style.borderColor = "green";
        } else if (userInput.length === 0) {
            document.getElementById(i).style.borderColor = "black";
        }
    }

    // function blockForbiddenChars(event) {
    //     console.log(event);
    //     value = event.target.value;
    //     event.target.value = preSanitize(value);
    // }

    // function preSanitize(input) {
    //     const allowedChars = /[A-Za-z0-9]/;
    //     const sanitizedOutput = input
    //         .split("")
    //         .map((char) => (allowedChars.test(char) ? char : ""))
    //         .join("");
    //     return sanitizedOutput;
    // }
</script>

<tr class="tabelahistorico">
    <td>{indice}</td>
    <td>{dados.NUMPEC === null || !dados.NUMPEC ? "S/I" : dados.NUMPEC}</td>
    <td>{dados.DESCRICAO === null ? "S/I" : dados.DESCRICAO}</td>
    <td>{dados.ESPECIF === null || !dados.ESPECIF ? "S/I" : dados.ESPECIF}</td>
    <td>{dados.LIE === null ? "S/I" : dados.LIE}</td>
    <td>{dados.LSE === null ? "S/I" : dados.LSE}</td>
    <td>{dados.INSTRUMENTO === null ? "S/I" : dados.INSTRUMENTO}</td>
    <td
        ><input
            on:input={checkColor("SETUP-" + indice)}
            onkeyup="this.value = this.value.toUpperCase()"
            id={"SETUP-" + indice}
            bind:value={value}
            name={idInput}
            type="text"
        /></td
    >
    <td
        ><input
            onkeyup="this.value = this.value.toUpperCase()"
            on:input={checkColor("M2-" + indice)}
            id={"M2-" + indice}
            bind:value={value}
            name="M{indice}"
            type="text "
        /></td
    >
    <td
        ><input
            onkeyup="this.value = this.value.toUpperCase()"
            on:input={checkColor("M3-" + indice)}
            id={"M3-" + indice}
            bind:value={value}
            name="M{indice}"
            type="text"
        /></td
    >
    <td
        ><input
            onkeyup="this.value = this.value.toUpperCase()"
            on:input={checkColor("M4-" + indice)}
            id={"M4-" + indice}
            bind:value={value}
            name="M{indice}"
            type="text"
        /></td
    >
    <td
        ><input
            onkeyup="this.value = this.value.toUpperCase()"
            on:input={checkColor("M5-" + indice)}
            id={"M5-" + indice}
            bind:value={value}
            name="M{indice}"
            type="text"
        /></td
    >

    {#each extraColumns as columnNumber, i}
        <td>
            <input
                onkeyup="this.value = this.value.toUpperCase()"
                on:input={checkColor("M-" + indice + columnNumber + i)}
                id={"M-" + indice + columnNumber + i}
                bind:value={value}
                name="M-{indice}"
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
