<script>
    export let dados;
    console.log("linha 2", dados);
    let datahora = dados.DATAHORA.split(".").map((value) => value.split("T"));
    let ano = datahora[0][0].slice(0, 4);
    let mes = datahora[0][0].slice(5, 7);
    let dia = datahora[0][0].slice(8, 10);
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
        <td
        >{dia === null || !dia ? "S?I" : dia}
        -{mes === null || !mes ? "S?I" : mes}
            -{ano === null || !ano ? "S?I" : ano}
        </td>
        <td
        >{datahora[0][1] === null || !datahora[0][1]
                ? "S?I"
                : datahora[0][1]}</td
        >
</tr>

<style>
    *:focus {
        outline: none;
    }
    .tabelahistorico {
        /* width: 100px; */
        margin: 1%;
        padding: 0%;
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
