<script>
    export let dados;
    let ano;
    let mes;
    let dia;
    let datahora;

    if (dados.DATAHORA === undefined || dados.DATAHORA === null) {
        datahora = "S/I";
        ano = "S/I";
        mes = "S/I";
        dia = "S/I";
    } else {
        datahora = dados.DATAHORA.split(".").map((value) => value.split("T"));
        ano = datahora[0][0].slice(0, 4);
        mes = datahora[0][0].slice(5, 7);
        dia = datahora[0][0].slice(8, 10);
    }
</script>

<tr class="tabelahistorico">
    <td>{dados.OP === null || !dados.OP ? "S/I" : dados.OP}</td>
    <td>{dados.MAQUINA === null ? "S/I" : dados.MAQUINA}</td>
    <td>{dados.BOAS === null || !dados.BOAS ? "S/I" : dados.BOAS}</td>
    <td>{dados.REFUGO === null ? "S/I" : dados.REFUGO}</td>
    <td
        >{dados.FALTANTE === null || dados.FALTANTE === undefined
            ? "S/I"
            : dados.FALTANTE}</td
    >
    <td>{dados.ODF === null ? "S/I" : dados.ODF}</td>

    {#if datahora !== "S/I"}
        <td>
            {dia === null || !dia ? "S/I" : dia}
            -{mes === null || !mes ? "S/I" : mes}
            -{ano === null || !ano ? "S/I" : ano}
        </td>
        <td
            >{datahora[0][1] === null ||
            datahora[0][1] === undefined ||
            !datahora[0][1]
                ? "S/I"
                : datahora[0][1]}</td
        >
    {/if}
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
        vertical-align: middle;
        align-items: center;
        background-color: white;
    }
</style>
