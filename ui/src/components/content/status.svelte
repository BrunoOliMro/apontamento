<script>
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
    let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);
    let status = 0;
    let IMAGEM = "";
    let odfData = [];
    // let imgReceive = "/images/04350243-1.jpg";

    setInterval(() => {
        status++;
    }, 200);

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/apontamento?NUMERO_ODF=${NUMERO_ODF}&CODIGO_MAQUINA=${CODIGO_MAQUINA}&NUMERO_OPERACAO=${NUMERO_OPERACAO}&IMAGEM=${IMAGEM}`;
    async function getOdfData() {
        const res = await fetch(urlString);
        odfData = await res.json();
        return odfData;
    }
    
    let resultado = getOdfData();
    // let urlStringImg = `/api/v1/IMAGEM?IMAGEM=${IMAGEM}`;
    // let resultadoImg = getImgdata();
    // async function getImgdata() {
    //     const res = await fetch(urlString);
    //     const odfData = await res.json();
    //     console.log(odfData)
    //     return odfData;
    // }

    resultado.then(()=>{
        const atributeSrcImg = "/images/00751302.jpg"
        odfData.forEach((element) => {
            let divSelector = document.querySelector("div");
            let imgElement = document.createElement("img");
            divSelector.appendChild(imgElement);
            imgElement.setAttribute("src", atributeSrcImg);
            imgElement.setAttribute("alt", "ferramenta");
            imgElement.style.width = "170px";
            imgElement.style.height = "170px";
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
    <div class="card" style="width:18rem; height: 18rem; ">
        <img src="/images/00060270-1.jpg" alt="">
    </div>
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
