<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    import { onMount } from "svelte";
    let urlString = `/api/v1/rip`;
    let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";
    let Item = "ITEM";
    let Descrição = "Descrição";
    let Instrumento = "Instrumento";
    let Especificacao = "Especificacao";
    let LIE = "LIE";
    let LSE = "LSE";
    let SETUP = "SETUP";
    let M2 = "M2";
    let M3 = "M3";
    let M4 = "M4";
    let M5 = "M5";
    let M6 = "M6";
    let M7 = "M7";
    let M8 = "M8";
    let M9 = "M9";
    let M10 = "M10";
    let M11 = "M11";
    let M12 = "M12";
    let M13 = "M13";
    let ripTable = [];
    let dados = [];
    let rowNumber = 1

    onMount(async () => {
        const res = await fetch(urlString);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });
</script>

<main>
    <Breadcrumb />
    <div>{Subtitle}</div>
    {#if ripTable.length != 0}
    {#each ripTable as row }
        {JSON.stringify(ripTable[0])}
    {/each}
        <thead class="thead">
            <th scope="row">{ripTable[0].ITEM === undefined ? "ITEM" : Item}</th
            >
            <th scope="row">{ripTable[0].NUMPEC}</th>
            <th scope="row">{ripTable[0].DESCRICAO}</th>
            <th scope="row">{ripTable[0].INSTRUMENTO}</th>
            <th scope="row">{ripTable[0].ESPECIFICACAO}</th>
            <th class="table-active" scope="row">{ripTable[0].LIE}</th>
            <th class="table-active" scope="row">{ripTable[0].LSE}</th>
            <th class="table-active" scope="row">{SETUP}</th>
            <th scope="row">{M2}</th>
            <th scope="row">{M3}</th>
            <th scope="row">{M4}</th>
            <th scope="row">{M5}</th>
            <th scope="row">{M6}</th>
            <th scope="row">{M7}</th>
            <th scope="row">{M8}</th>
            <th scope="row">{M9}</th>
            <th scope="row">{M10}</th>
            <th scope="row">{M11}</th>
            <th scope="row">{M12}</th>
            <th scope="row">{M13}</th>
        </thead>
        <tbody class="tbody" /><tbody>
            <tr class="table-active">
                <th id="cell" scope="row">{rowNumber}</th>
                <th id="cell" scope="row">{ripTable[0].NUMPEC}</th>
                <th id="cell" scope="row">{ripTable[0].DESCRICAO}</th>
                <th id="cell" scope="row">{ripTable[0].INSTRUMENTO}</th>
                <th id="cell" scope="row">{ripTable[0].ESPECIFICACAO}</th>
                <th class="table-active" id="cell" scope="row">{ripTable[0].LIE}</th>
                <th class="table-active" id="cell" scope="row">{ripTable[0].LSE}</th>
                <th class="table-active" id="cell" scope="row">{SETUP}</th>
            </tr>
            <tr class="table-active">
                <th scope="row">2</th>
            </tr>
            <tr class="table-active">
                <th scope="row">3</th>
            </tr>
        </tbody>
    {:else}
        <h3>Não há histórico para exibir</h3>
    {/if}
</main>

<style>
    #cell{
        margin: 1%;
        display: inline;
        justify-content: space-between;
    }
    th {
        margin: 1%;
    }
    .thead {
        margin: 1%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: center;
    }
    main {
        margin: 1%;
    }
    div {
        font-size: 30px;
        display: flex;
        justify-content: center;
    }
</style>
