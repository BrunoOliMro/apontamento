<script>
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
    let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);
    let status = 0;
    let IMAGEM = "";

    setInterval(() => {
        status++;
    }, 200);

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/apontamento?NUMERO_ODF=${NUMERO_ODF}&CODIGO_MAQUINA=${CODIGO_MAQUINA}&NUMERO_OPERACAO=${NUMERO_OPERACAO}&IMAGEM=${IMAGEM}`;
    let resultado = getOdfData();
    async function getOdfData() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        return odfData;
    }

    let urlStringImg = `/api/v1/IMAGEM?IMAGEM=${IMAGEM}`;
    let resultadoImg = getImgdata();
    async function getImgdata() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        return odfData;
    }
</script>

<main>
    {#await resultado}
        <div>...</div>
    {:then dadosOdf}
        {#if status <= 50}
            <div style="background-color:black" id="status">
                {dadosOdf[0].APT_TEMPO_OPERACAO}
            </div>
        {/if}
        {#if status > 50 && status < 100}
            <div style="background-color:blue" id="status">
                {dadosOdf[0].APT_TEMPO_OPERACAO}
            </div>
        {/if}
        {#if status > 100 && status < 150}
            <div style="background-color:red" id="status">
                {dadosOdf[0].APT_TEMPO_OPERACAO}
            </div>
        {/if}
        {#if status > 150}
            <div style="background-color:gray" id="status">
                {dadosOdf[0].APT_TEMPO_OPERACAO}
            </div>
        {/if}
        <div class="card" style="width:18rem; height: 18rem; ">{IMAGEM}</div>
    {/await}
</main>

<style>
    main {
        display: flex;
    }
    div {
        margin-top: 5%;
        margin-right: 2%;
    }
    #status {
        width: 20%;
    }
</style>
