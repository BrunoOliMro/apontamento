<script>
    let status = 0;
    let IMAGEM = "";
    let urlString = `/api/v1/IMAGEM`;

    setInterval(() => {
        status++;
    }, 200);

    async function getIMAGEM() {
        const res = await fetch(urlString);
        IMAGEM = await res.json();
        console.log(IMAGEM);
        return IMAGEM;
    }

    let resultado = getIMAGEM();
</script>

<div>
    {#await resultado}
        <div>...</div>
    {:then dadosOdf}
        {#if status <= 50}
            <div class="item" style="background-color:black" id="status">
                {dadosOdf[0].APT_TEMPO_OPERACAO}
            </div>
        {/if}
        {#if status > 50 && status < 100}
            <div class="item" style="background-color:blue" id="status">
                {dadosOdf[0].APT_TEMPO_OPERACAO}
            </div>
        {/if}
        {#if status > 100 && status < 150}
            <div class="item" style="background-color:red" id="status">
                {dadosOdf[0].APT_TEMPO_OPERACAO}
            </div>
        {/if}
        {#if status > 150}
            <div class="item" style="background-color:gray" id="status">
                {dadosOdf[0].APT_TEMPO_OPERACAO}
            </div>
        {/if}
        <img src={IMAGEM[0].img} alt="" />
    {/await}
</div>

<style>
    div {
        display: flex;
        margin-top: 5%;
        margin-right: 2%;
    }
    #status {
        width: 20%;
        border-radius: 0px, 10px, 10px, 0px;
    }

    img {
        width: 18rem;
        height: 18rem;
        border-radius: 3px;
    }

    @media (max-width: 400px) {
        img {
            width: fit-content;
            border-radius: 3px;
            width: 100px;
            height: 100px;
        }
    }
    @media (max-width: 850px) {
        img {
            width: fit-content;
            width: 200px;
            height: 200px;
            border-radius: 3px;
        }
    }
</style>
