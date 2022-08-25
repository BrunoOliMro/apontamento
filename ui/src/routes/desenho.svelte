<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    export let Subtitle = "DESENHO";
    let IMAGEM = [];
    
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/desenho?IMAGEM=${IMAGEM}`;
    let resultado = getOdfData();
    async function getOdfData() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        return odfData;
    }

    function generateCardImg (){
        console.log("vai gerar as imagens dinamicamente")
    }
</script>

<main>
    <Breadcrumb />
    <div class="subtitle">{Subtitle}</div>
    <div class="card" >
        <img src="/images/00060270-1.jpg" alt="">
    </div>
</main>

<style>
    main {
        margin: 1%;
    }
    .card {
        margin-left: 5%;
        margin-right: 5%;
    }
    .subtitle {
        font-size: 30px;
        display: flex;
        justify-content: center;
    }
</style>
