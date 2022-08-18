<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    export let Subtitle = "Selecione as Ferramentas necessarias: ";
    const dataFromBarcode = localStorage.getItem("barcodeData");
    
    let APT_TEMPO_OPERACAO = '';

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/ferramenta?APT_TEMPO_OPERACAO=${APT_TEMPO_OPERACAO}`;
    let resultado = getOdfData();
    async function getOdfData() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        return odfData;
    }
</script>

<main>
    <Breadcrumb />
    {Subtitle}
    <div class="content">
        <div>
            <a class="card" href=""><div /></a>
            <a class="card" href=""><div /></a>
        </div>
        <div>
            <a class="card" href=""><div /></a>
            <a class="card" href=""><div /></a>
        </div>
        <div>
            <a class="card" href=""><div /></a>
            <a class="card" href=""><div /></a>
        </div>
        <div>
            <a class="card" href=""><div /></a>
            <a class="card" href=""><div /></a>
        </div>
        <div>
            <a class="card" href=""><div /></a>
            <a class="card" href=""><div /></a>
        </div>
    </div>
</main>

<style>
    main {
        margin: 1%;
    }
    .content {
        margin-left: 5%;
        margin-right: 5%;
        justify-content: center;
        align-items: center;
        text-align: center;
        display: flex;
        flex-direction: row;
    }

    a:hover {
        border: 5px solid rgb(0, 0, 0);
    }
    

    .card {
        margin: 10%;
        width: 160px;
        height: 160px;
        cursor: pointer;
        margin: 10%;
    }
</style>
