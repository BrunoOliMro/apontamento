<script>
    let tempoDecorrido = 0;
    let tempodePro = [];
    let urlString = `/api/v1/status`;
    let url = `/api/v1/imagem`;
    let tempoMax = null;
    let imagem = [];
    let shwowSuper = false;
    let showRed = false;
    let showGreen = false;
    let showBlue = false;
    async function getTempo() {
        const res = await fetch(urlString);
        tempodePro = await res.json();
        tempoMax = Number(tempodePro);
    }
    async function getImagem() {
        const res = await fetch(url);
        imagem = await res.json();
    }
    // setInterval(() => {
    //     if (tempoMax <= 0) {
    //         shwowSuper = true;
    //         showRed = true;
    //     } else {
    //         let menorFif = (Number(50) * Number(tempoMax)) / Number(100);
    //         let maiorFif = (Number(75) * Number(tempoMax)) / Number(100);
    //         let excedido = (Number(100) * Number(tempoMax)) / Number(100);
    //         tempoDecorrido++;
    //         if (tempoDecorrido <= menorFif) {
    //             showGreen = true;
    //             showRed = false;
    //             showBlue = false;
    //             shwowSuper = false;
    //         }
    //         if (tempoDecorrido >= menorFif && tempoDecorrido <= maiorFif) {
    //             showGreen = false;
    //             showBlue = true;
    //             showRed = false;
    //             shwowSuper = false;
    //         }
    //         if (tempoDecorrido >= maiorFif) {
    //             showRed = true;
    //             showGreen = false;
    //             showBlue = false;
    //         }
    //         if (tempoDecorrido >= excedido) {
    //             shwowSuper = true;
    //         } else {
    //             shwowSuper = false;
    //         }
    //     }
    // }, 1000);
    function s (){
        
    }

    function close() {
        shwowSuper = false;
    }
    let resultado = getTempo();
    let callImagem = getImagem();
</script>

<div class="content">
    {#await resultado}
        <div>...</div>
    {:then itens}
        {#if showGreen === true}
            <div
                class="item"
                style="background-color:green"
                id="tempoDecorrido"
            />
        {/if}
        {#if showBlue === true}
            <div
                class="item"
                style="background-color:blue"
                id="tempoDecorrido"
            />
        {/if}
        {#if showRed === true}
            <div
                class="item"
                style="background-color:red"
                id="tempoDecorrido"
            />
        {/if}
        <img class="img" src={String(imagem)} alt="" />
    {/await}

    {#if shwowSuper === true}
        <div class="fundo">
            <div class="timeOver">
                <h3>Tempo Excedido</h3>
                <form action="api/v1/apontar" method="POST" />
                <p>Insira um supervisor para continuar</p>
                <input type="text" />
                <p on:click={close}>Fechar</p>
            </div>
        </div>
    {/if}
</div>

<style>
    .timeOver {
        color: white;
        background-color: black;
        width: 500px;
        height: 250px;
        /* position: absolute;
        top: 20%;
        left: 40%; */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 3px;
    }
    input {
        border-radius: 3px;
    }
    .fundo {
        position: fixed;
        top: 0;
        left: 0;
        background-color: rgba(17, 17, 17, 0.618);
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
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
