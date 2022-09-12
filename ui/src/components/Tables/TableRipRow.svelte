<script>
    export let dados;
</script>
<tr class="tabelahistorico">
    <th scope="row">{dados.NUMPEC === null || !dados.NUMPEC ? "S/I" : dados.NUMPEC}</th>
    <th scope="row">{dados.DESCRICAO === null ? "S/I" : dados.DESCRICAO}</th>
    <th scope="row">{dados.ESPECIF === null || !dados.ESPECIF ? "S/I" : dados.ESPECIF}</th>
    <th scope="row">{dados.LIE === null ? "S/I" : dados.LIE}</th>
    <th scope="row">{dados.LSE === null ? "S/I" : dados.LSE}</th>
    <th scope="row">{dados.REV === null || !dados.REV ? "S/I" : dados.REV}</th>
    <th scope="row">{dados.INSTRUMENTO === null ? "S/I" : dados.INSTRUMENTO}</th>
    <th scope="row"><input type="text"></th>
    <th scope="row"><input type="text"></th>
    <th scope="row"><input type="text"></th>
    <th scope="row"><input type="text"></th>
    <th scope="row"><input type="text"></th>
    <th scope="row"><input type="text"></th>
    <th scope="row"><input type="text"></th>
</tr>
<style>
    .tabelahistorico{
        /* width: 100px; */
        background-color: white;
    }
    tr {
        background-color: white;
        text-align: center;
    }
    /* .rowIdentadaEsquerda {
        text-align: left;
    } */
    th {
        /* width: 100%; */
        vertical-align: middle;
        align-items: center;
        background-color: white;
    }
    input{
        width: 80px;
        border-radius: 3px;
    }
</style>