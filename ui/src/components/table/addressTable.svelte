<script>
    export let data;
    export let index;
    export let min;
    export let max;

    let date;
    if (data) {
        let hour = data.DATAHORA.slice(11, 19);
        let day = data.DATAHORA.slice(8, 10);
        let year = data.DATAHORA.slice(0, 4);
        let month = data.DATAHORA.slice(5, 7);

        date = day + "/" + month + "/" + year + "  " + hour;
    }

</script>

{#if index > min && index < max }
    <tr class="table-area">
        <td>{!index ? "S/I" : index}</td>
        <td>{!date ? "S/I" : date}</td>
        <td>{!data.ODF ? "S/I" : data.ODF}</td>
        <td>{!data.CODIGO_FILHO ? "S/I" : data.CODIGO_FILHO}</td>
        <td>{!data.ENDERECO_ATUAL ? "S/I" : data.ENDERECO_ATUAL}</td>
        <td>{!data.STATUS ? "S/I" : data.STATUS}</td>
        <td>{!data.QUANTIDADE ? "S/I" : data.QUANTIDADE}</td>
    </tr>
{/if}

<style>
    *:focus {
        outline: none;
    }

    .table-area {
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
