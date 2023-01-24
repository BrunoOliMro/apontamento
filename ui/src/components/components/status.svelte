<script>
    // @ts-nocheck
    const imageLoader = `/images/axonLoader.gif`;
    const searchIcon = `/images/search.png`;
    let maxTimeSpend = null;
    let greenBar = true;
    let blueBar = false;
    let redBar = false;
    export let odfData;
    let timeSpend = 0;
    let image = [];

    if (!odfData.codData.data) {
        odfData.codData.data = "";
    } else {
        maxTimeSpend = odfData.prodTime.data;
        image = odfData.image.data;
    }

    setInterval(() => {
        let menorFif = (Number(50) * Number(maxTimeSpend)) / Number(100);
        let maiorFif = (Number(75) * Number(maxTimeSpend)) / Number(100);
        let excedido = (Number(100) * Number(maxTimeSpend)) / Number(100);

        timeSpend++;

        if (timeSpend <= menorFif) {
            redBar = false;
            blueBar = false;
            // modalSuper = false;
            greenBar = true;
        } else if (timeSpend >= menorFif && timeSpend <= maiorFif) {
            greenBar = false;
            blueBar = true;
            redBar = false;
            // modalSuper = false;
        } else if (timeSpend >= maiorFif) {
            redBar = true;
            greenBar = false;
            blueBar = false;
        } else if (timeSpend >= excedido) {
            // modalSuper = true;
            greenBar = false;
            redBar = true;
        } else if (maxTimeSpend <= 0 || maxTimeSpend === null) {
            // modalSuper = true;
            redBar = true;
        } else {
            // modalSuper = false;
        }
    }, 1000);
</script>

{#await odfData.codData.data}
    <div class="image-loader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then}
    <div class="conj">
        {#if greenBar === true}
            <div class="green" id="tempoDecorrido" />
        {/if}
        {#if blueBar === true}
            <div class="blue" id="tempoDecorrido" />
        {/if}
        {#if redBar === true}
            <div class="red" id="tempoDecorrido" />
        {/if}
        <div class="icon-container">
            <a class="out" href="/#/desenho/">
                <img class="search-icon" src={searchIcon} alt="" />
            </a>
            <img class="img" src={String(image)} alt="" />
        </div>
    </div>
{/await}

<style>
    .icon-container {
        position: relative;
        display: flex;
        justify-content: left;
        align-self: left;
        text-align: left;
        margin: 0%;
        padding: 0%;
    }
    .search-icon {
        width: 25px;
        height: 25px;
        display: block;
        top: 450px;
        left: 430px;
        /* bottom: 400px; */
        position: absolute;
        z-index: 999999999999;
    }
    .img {
        height: 474px;
        width: 460px;
        z-index: 1;
    }
    .conj {
        display: flex;
        flex-direction: row;
        align-items: left;
        text-align: left;
        justify-content: left;
        margin: 0%;
        padding: 0%;
        height: 400px;
    }

    .green {
        background-color: green;
    }
    .red {
        background-color: red;
    }
    .blue {
        background-color: blue;
    }

    h3 {
        font-size: 20px;
        margin: 0px, 0px, 0px, 0px;
        padding: 0px;
        width: 460px;
        align-items: left;
        text-align: left;
        justify-content: left;
        display: flex;
    }
    /* h2 {
        font-size: 32px;
    }
    input {
        border-radius: 12px;
        height: 40px;
        width: 378px;
    }
    .modal-subtitle {
        display: flex;
        flex-direction: column;
    }
    .background-modal {
        transition: 1s;
        position: fixed;
        top: 0;
        left: 0;
        margin: 0px;
        padding: 0px;
        background-color: rgba(17, 17, 17, 0.618);
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999999999999999999999999999999;
    }
    .modal-title {
        margin-left: 0px;
        margin-bottom: 25px;
        margin-right: 0px;
        margin-top: 0px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
    }
    .modal-content {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 500px;
        height: 225px;
        display: block;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
    }
    .modal-display {
        display: flex;
        flex-direction: column;
        margin-top: 25px;
        margin-bottom: 0%;
        margin-left: 25px;
        margin-right: 0%;
        padding: 0%;
    } */
    .loader {
        margin: 0%;
        position: relative;
        width: 10vw;
        height: 5vw;
        padding: 1.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999999999999999999999999999999999999999999999999999999;
    }
    .image-loader {
        margin: 0%;
        padding: 0%;
        position: fixed;
        top: 0;
        left: 0;
        background-color: black;
        height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999999999999999999999999999999999999999999999999999999;
    }
    #tempoDecorrido {
        margin: 0%;
        padding: 0%;
        border-radius: 6px 0px 0px 6px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: left;
        align-items: left;
        text-align: left;
        width: 70px;
        height: 478px;
    }
    div {
        margin: 5%;
        padding: 0%;
    }
    div {
        display: flex;
        margin-top: 5%;
        margin-right: 2%;
    }

    img {
        width: 18rem;
        height: 400px;
        border-radius: 4px;
    }

    /* @media (max-width: 574px) {
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
    } */
</style>
