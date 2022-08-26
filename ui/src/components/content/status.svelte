<script>
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
    let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);
    let status = 0;
    let IMAGEM = [];

    setInterval(() => {
        status++;
    }, 200);

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/IMAGEM?&IMAGEM=${IMAGEM}`;
    async function getIMAGEM() {
        const res = await fetch(urlString);
        IMAGEM = await res.json();
        console.log(IMAGEM)
        return IMAGEM;
    }
    
    let resultado = getIMAGEM();
    resultado.then(()=>{
        const atributeSrcImg = IMAGEM[0].img
        IMAGEM.forEach((element) => {
            let divSelector = document.querySelector("*");
            let imgElement = document.createElement("img");
            divSelector.appendChild(imgElement);
            imgElement.setAttribute("src", atributeSrcImg);
            imgElement.setAttribute("alt", "ferramenta");
            imgElement.style.width = "220px";
            imgElement.style.height = "220px";
            imgElement.style.margin = "2%";
            imgElement.style.borderRadius = "3px";
        });
    })


</script>

<div>
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
    {/await}
    <!-- <div class="card" style="width:18rem; height: 18rem; ">
        <img src="/images/00060270-1.jpg" alt="">
    </div> -->
    {resultado[0]}
</div>

<style>
    div {
        display: flex;
        margin-top: 5%;
        margin-right: 2%;
    }
    #status {
        width: 20%;
    }
</style>
