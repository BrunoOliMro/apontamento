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

<div class="content">
    {#await resultado}
        <div>...</div>
    {:then dadosOdf}
        {#if status <= 50}
            <div class="item" style="background-color:black" id="status">
                <!-- {dadosOdf[0].APT_TEMPO_OPERACAO} -->
            </div>
        {/if}
        {#if status > 50 && status < 100}
            <div class="item" style="background-color:blue" id="status">
                <!-- {dadosOdf[0].APT_TEMPO_OPERACAO} -->
            </div>
        {/if}
        {#if status > 100 && status < 150}
            <div class="item" style="background-color:red" id="status">
                <!-- {dadosOdf[0].APT_TEMPO_OPERACAO} -->
            </div>
        {/if}
        {#if status > 150}
            <div class="item" style="background-color:gray" id="status">
                <!-- {dadosOdf[0].APT_TEMPO_OPERACAO} -->
            </div>
        {/if}
        <img class="img" src={IMAGEM[0].img} alt="" />
    {/await}
</div>

<style>
    div {
        display: flex;
        margin-top: 5%;
        margin-right: 2%;
    }
    .item {
            width: 20px;
        }

    img {
        width: 18rem;
        height: 18rem;
        border-radius: 3px;
    }

    @media (max-width: 574px) {
        .img {
            border-radius: 3px;
            width: 250px;
            height: 250px;
        }
        div {
            margin: 0px;
            padding: 0px;
            justify-content: left;
            align-items: left;
            text-align: left;
           }
           .item{
            margin-left: 1%;
            width: 30px;
        }
    }
        
    @media screen and (min-width: 575px) {
        .img {
            border-radius: 3px;
            width: 300px;
            height: 300px;
        }
        div {
            margin: 0px;
            padding: 0px;
            justify-content: left;
            align-items: left;
            text-align: left;
        }
        .item{
            width: 30px;
            margin-left: 1%;
        }
        .content{
            margin-left: 5%;
        }
    }
    @media screen and (min-width: 860px) {
        .img {
            border-radius: 3px;
            width: 285px;
            height: 285px;
        }
        div {
            margin: 0px;
            padding: 0px;
            justify-content: left;
            align-items: left;
            text-align: left;
        }
        .item{
            width: 30px;
        }
    }
    @media screen and (min-width: 1060px) {
        .img {
            border-radius: 3px;
            width: 300px;
            height: 300px;
        }
        div {
            margin: 0px;
            padding: 0px;
            justify-content: left;
            align-items: left;
            text-align: left;
        }
        .item{
            width: 30px;
        }
    }
    @media screen and (min-width: 1260px) {
        .img {
            border-radius: 3px;
            width: 350px;
            height: 350px;
        }
        div {
            margin: 0px;
            padding: 0px;
            justify-content: left;
            align-items: left;
            text-align: left;
        }
        .item{
            width: 28px;
        }
    }
    
    @media (min-width: 1600px) {
        .img {
            width: 350px;
            height: 350px;
            border-radius: 3px;
        }
        .content {
            width: 100%;
            height: 100%;
        }
        div {
            margin: 0px;
            padding: 0px;
            justify-content: left;
            align-items: left;
            text-align: left;
        }
        .item {
            width: 30px;
        }
    }
</style>
