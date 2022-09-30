<script>
    import { init } from "svelte/internal";


    // @ts-nocheck

    export let dados;
    export let indice;
    export let extraColumns;
    let value = [];
    let some = 10;

    function checkColor(i) {
        // @ts-ignore
        let userInput = document.getElementById(i).value;
        console.log(userInput);
        let lie = dados.LIE;
        let lsd = dados.LSE;
        console.log(i);
        if (userInput < lie && userInput.length !== 0) {
            document.getElementById(i).style.borderColor = "red";
        } else if (userInput > lsd && userInput.length !== 0) {
            document.getElementById(i).style.borderColor = "red";
        } else if (userInput > lie && userInput < lsd && userInput.length !==0) {
            document.getElementById(i).style.borderColor = "green";
        } else if(userInput.length === 0) {
            document.getElementById(i).style.borderColor = "black";
        }
    }
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
            id={"SETUP-" + indice}
            name="SETUP{indice}"
            type="text"
        /></td
    >
    <td
        ><input
            on:input={checkColor("M2-" + indice)}
            id={"M2-" + indice}
            name="M{indice}"
            type="text "
        /></td
    >
    <td
        ><input
            on:input={checkColor("M3-" + indice)}
            id={"M3-" + indice}
            name="M{indice}"
            type="text"
        /></td
    >
    <td
        ><input
            on:input={checkColor("M4-" + indice)}
            id={"M4-" + indice}
            name="M{indice}"
            type="text"
        /></td
    >
    <td
        ><input
            on:input={checkColor("M5-" + indice)}
            id={"M5-" + indice}
            name="M{indice}"
            type="text"
        /></td
    >

    {#each extraColumns as columnNumber, i}
        <td>
            <input
                on:input={checkColor("M-" + indice + columnNumber + i)}
                id={"M-" + indice + columnNumber + i}
                name="M{indice}"
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
