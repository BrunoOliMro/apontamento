<script>
    export let data;
    export let index;
    export let perPage;
    export let totalItens;
    export let totalPages;
    export let currentPage;

    let date;
    if (data) {
        let hour = data.DATAHORA.slice(11, 19);
        let day = data.DATAHORA.slice(8, 10);
        let year = data.DATAHORA.slice(0, 4);
        let month = data.DATAHORA.slice(5, 7);

        date = day + "/" + month + "/" + year + "  " + hour;
    }

</script>

{#if index > currentPage * 0 && index < currentPage * 11 }
    <tr class="tabelahistorico">
        <td>{!index ? "S/I" : index}</td>
        <td>{!date ? "S/I" : date}</td>
        <td>{!data.ODF ? "S/I" : data.ODF}</td>
        <td>{!data.CODIGO_FILHO ? "S/I" : data.CODIGO_FILHO}</td>
        <td>{!data.ENDERECO_ATUAL ? "S/I" : data.ENDERECO_ATUAL}</td>
        <td>{!data.STATUS ? "S/I" : data.STATUS}</td>
        <td>{!data.QUANTIDADE ? "S/I" : data.QUANTIDADE}</td>
    </tr>
{/if}

<!-- {#if totalItens > perPage && index > 11  && index < 22 && currentPage === 2}
    <tr class="tabelahistorico">
        <td>{!index ? "S/I" : index}</td>
        <td>{!date ? "S/I" : date}</td>
        <td>{!data.ODF ? "S/I" : data.ODF}</td>
        <td>{!data.CODIGO_FILHO ? "S/I" : data.CODIGO_FILHO}</td>
        <td>{!data.ENDERECO_ATUAL ? "S/I" : data.ENDERECO_ATUAL}</td>
        <td>{!data.STATUS ? "S/I" : data.STATUS}</td>
        <td>{!data.QUANTIDADE ? "S/I" : data.QUANTIDADE}</td>
    </tr>
{/if}

{#if totalItens > perPage && index > 22 && currentPage === 3}
    <tr class="tabelahistorico">
        <td>{!index ? "S/I" : index}</td>
        <td>{!date ? "S/I" : date}</td>
        <td>{!data.ODF ? "S/I" : data.ODF}</td>
        <td>{!data.CODIGO_FILHO ? "S/I" : data.CODIGO_FILHO}</td>
        <td>{!data.ENDERECO_ATUAL ? "S/I" : data.ENDERECO_ATUAL}</td>
        <td>{!data.STATUS ? "S/I" : data.STATUS}</td>
        <td>{!data.QUANTIDADE ? "S/I" : data.QUANTIDADE}</td>
    </tr>
{/if} -->
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
        width: 15%;
    }
</style>
