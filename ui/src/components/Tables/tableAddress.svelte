<script>
    export let data;
</script>

<tr class="tabelahistorico">
    <td>{data.DATAHORA === null || !data.DATAHORA ? "S/I" : data.DATAHORA}</td>
    <td>{data.ODF === null || !data.ODF ? "S/I" : data.ODF}</td>
    <td>{data.CODIGO_FILHO === null || !data.CODIGO_FILHO ? "S/I" : data.CODIGO_FILHO}</td>
    <td>{data.ENDERECO_ATUAL === null || !data.ENDERECO_ATUAL ? "S/I": data.ENDERECO_ATUAL}</td>
    <td>{data.STATUS === null || !data.STATUS ? "S/I" : data.STATUS}</td>
    <td>{data.QUANTIDADE === null || !data.QUANTIDADE ? "S/I" : data.QUANTIDADE}</td>
</tr>

<style>
    *:focus {
        outline: none;
    }

    .tabelahistorico {
        font-size: 25px;
    }

    tr {
        background-color: white;
        text-align: center;
    }
    td {
        margin: 1%;
        padding: 0%;
        vertical-align: middle;
        align-items: center;
        background-color: white;
        width: 18%;
    }
</style>
