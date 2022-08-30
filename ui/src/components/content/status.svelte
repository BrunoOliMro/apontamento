<script>
    let status = 0;
    let IMAGEM = '';
    let urlString = `/api/v1/IMAGEM`;

    setInterval(() => {
        status++;
    }, 200)

    async function getIMAGEM() {
        const res = await fetch(urlString);
        IMAGEM = await res.json();
        console.log(IMAGEM)
        return IMAGEM;
    }
    
    let resultado = getIMAGEM();
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
        <img src={IMAGEM[0].img} alt="">
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
    }

    img{
        width: 18rem;
        height: 18rem;
        border-radius: 3px;
    }
</style>
