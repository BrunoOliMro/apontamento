<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte"
    import Table from "../components/content/table.svelte";
    export let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";

    const dataFromBarcode = localStorage.getItem("barcodeData");
    
    let APT_TEMPO_OPERACAO = '';

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/rip?APT_TEMPO_OPERACAO=${APT_TEMPO_OPERACAO}`;
    let resultado = getOdfData();
    async function getOdfData() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        return odfData;
    }
    
</script>

<main>
        <Breadcrumb />
        <div>{Subtitle}</div>
        <Table/>
</main>

<style>
    main{
        margin: 1%;
    }
    div{
        font-size: 30px;
        display: flex;
        justify-content: center;
    }
</style>
