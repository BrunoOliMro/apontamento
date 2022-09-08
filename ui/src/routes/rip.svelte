<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    import { onMount } from "svelte";
    let urlString = `/api/v1/rip`;
    let urlStringss = `/api/v1/rip1`;
    let urlStringssSS = `/api/v1/rip2`;
    let urlStringssSS1 = `/api/v1/rip3`;
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
    let rowNumber = 1;

    onMount(async () => {
        const res = await fetch(urlString);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });

    onMount(async () => {
        const res = await fetch(urlStringss);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });

    onMount(async () => {
        const res = await fetch(urlStringssSS);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });

    onMount(async () => {
        const res = await fetch(urlStringssSS1);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });
</script>

<main>
    <Breadcrumb />
    <div>{Subtitle}</div>
    {#if ripTable.length != 0}
        <thead>
            {#each Object.keys(ripTable[0]) as ripTable}
                <th scope="col" class="cellBody ">{ripTable}</th>
            {/each}
        </thead>

        <thead>
            {#each Object.values(ripTable[0]) as ripTable}
                <th scope="col" class="cellStats ">{ripTable}</th>
            {/each}
        </thead>
    {:else}
        <h3>Não há histórico para exibir</h3>
    {/if}
</main>

<style>
    .cellStats {
        display: flex;
    }
    .cellBody {
        display: inline;
        margin: 1%;
        flex-direction: row;
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
