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
        <td
            ><input
                id="SETUP-{dados.NUMPEC}-{indice}"
                name="SETUP"
                type="text"
            /></td
        >
        <td
            ><input
                id="M2"
                name="M2"
                type="text"
            /></td
        >
        <td
            ><input
                
                id="M3"
                name="M3"
                type="text"
            /></td
        >
        <td
            ><input
                
                id="M4"
                name="M4"
                type="text"
            /></td
        >
        <td
            ><input
                
                id="M5"
                name="M5"
                type="text"
            /></td
        >

    {#each extraColumns as columnNumber}
        <td>
            <input
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
