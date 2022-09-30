<script>
    import { onMount } from "svelte";
    let tempoDecorrido = 0;
    let tempodePro = [];
    let urlString = `/api/v1/STATUS`;
    let url = `/api/v1/imagem`;
    let tempoMax = null;
    let imagem = [];
    let shwowSuper = false;

    onMount(async () => {
        const res = await fetch(urlString);
        tempodePro = await res.json();
        tempoMax = Number(tempodePro);
        console.log(tempoMax);
        setInterval(() => {
            shwowSuper = false
            if (tempoDecorrido > tempoMax) {
                shwowSuper = true;
            } else {
                shwowSuper = false;
                tempoDecorrido++;
            }
        }, 1000);;
    });

    onMount(async () => {
        const res = await fetch(url);
        imagem = await res.json();
        console.log(imagem[0].img);
        return imagem[0].img
    });
</script>

<div class="content">
    {#if tempodePro.length !== 0}
        {#if tempoDecorrido <= tempoMax}
            <div
                class="item"
                style="background-color:black"
                id="tempoDecorrido"
            >
                <!-- {dadosOdf[0].APT_TEMPO_OPERACAO} -->
            </div>
        {/if}
        {#if tempoDecorrido > tempoMax && tempoDecorrido < tempoMax}
            <div class="item" style="background-color:blue" id="tempoDecorrido">
                <!-- {dadosOdf[0].APT_TEMPO_OPERACAO} -->
            </div>
        {/if}
        {#if tempoDecorrido > tempoMax && tempoDecorrido < tempoMax}
            <div class="item" style="background-color:red" id="tempoDecorrido">
                <!-- {dadosOdf[0].APT_TEMPO_OPERACAO} -->
            </div>
        {/if}
        {#if tempoDecorrido > tempoMax}
            <div class="item" style="background-color:gray" id="tempoDecorrido">
                <!-- {dadosOdf[0].APT_TEMPO_OPERACAO} -->
            </div>
        {/if}
        <img class="img" src={imagem[0].img} alt="" />
    {:else}
        <h3>Não há histórico para exibir</h3>
    {/if}
    
    {#if shwowSuper === true}
        <div>
            <h3>tempo acabo my friend</h3>
            <input type="text" />
        </div>
    {/if}
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
        .item {
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
        .item {
            width: 30px;
            margin-left: 1%;
        }
        .content {
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
        .item {
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
        .item {
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
        .item {
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
