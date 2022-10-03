<script>
    export let dados;
</script>

<tr class="tabelahistorico">
    <td>{dados.OP === null || !dados.OP ? "S/I" : dados.OP}</td>
    <td>{dados.MAQUINA === null ? "S/I" : dados.MAQUINA}</td>
    <td>{dados.BOAS === null || !dados.BOAS ? "S/I" : dados.BOAS}</td>
    <td>{dados.REFUGO === null ? "S/I" : dados.REFUGO}</td>
    <td>{dados.FALTANTE === null || dados.FALTANTE === undefined
     ? "S/I" : dados.FALTANTE}</td>
    <td>{dados.ODF === null ? "S/I" : dados.ODF}</td>

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
</style>
