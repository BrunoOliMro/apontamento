<script>
    export let dados;
    export let indice;
    export let extraColumns;
    let value = [];
    let some = 10
</script>

<tr class="tabelahistorico">
    <td>{indice}</td>
    <td>{dados.NUMPEC === null || !dados.NUMPEC ? "S/I" : dados.NUMPEC}</td>
    <td>{dados.DESCRICAO === null ? "S/I" : dados.DESCRICAO}</td>
    <td>{dados.ESPECIF === null || !dados.ESPECIF ? "S/I" : dados.ESPECIF}</td>
    <td>{dados.LIE === null ? "S/I" : dados.LIE}</td>
    <td>{dados.LSE === null ? "S/I" : dados.LSE}</td>
    <td>{dados.INSTRUMENTO === null ? "S/I" : dados.INSTRUMENTO}</td>
    {#if some < dados.LIE}
        <td
            ><input
                class="some"
                id="SETUP-{dados.NUMPEC}-{indice}"
                name="SETUP"
                type="text"
            /></td
        >
        <td
            ><input
                class="some"
                id="M2"
                name="M2"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="green"
                class="some"
                id="M3"
                name="M3"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="black"
                class="some"
                id="M4"
                name="M4"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="gray"
                class="some"
                id="M5"
                name="M5"
                type="text"
            /></td
        >
    {:else if some > dados.LSE}
        <td
            ><input
                class="an"
                id="SETUP-{dados.NUMPEC}-{indice}"
                name="SETUP"
                type="text"
            /></td
        >
        <td
            ><input
                class="an"
                id="M2"
                name="M2"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="green"
                class="an"
                id="M3"
                name="M3"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="black"
                class="an"
                id="M4"
                name="M4"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="gray"
                class="an"
                id="M5"
                name="M5"
                type="text"
            /></td
        >
    {:else}
        <td
            ><input
                class="no"
                id="SETUP-{dados.NUMPEC}-{indice}"
                name="SETUP"
                type="text"
            /></td
        >
        <td
            ><input
                class="no"
                id="M2"
                name="M2"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="green"
                class="no"
                id="M3"
                name="M3"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="black"
                class="no"
                id="M4"
                name="M4"
                type="text"
            /></td
        >
        <td
            ><input
                style:background-color="gray"
                class="no"
                id="M5"
                name="M5"
                type="text"
            /></td
        >
    {/if}

    {#each extraColumns as columnNumber}
        <td>
            <input
                style:background-color="yellow"
                class="some"
                id="M{columnNumber}"
                name="M{columnNumber}"
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
        width: 80px;
        border-radius: 3px;
    }
</style>
