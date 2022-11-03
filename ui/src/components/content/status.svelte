<script>
    // @ts-nocheck
    let imageLoader = `/images/axonLoader.gif`;
    let tempoDecorrido = 0;
    let tempodePro = [];
    let supervisorApi = `/api/v1/supervisor`;
    let urlString = `/api/v1/status`;
    let url = `/api/v1/imagem`;
    let tempoMax = null;
    let imagem = [];
    let shwowSuper = false;
    let showRed = false;
    let showGreen = true;
    let showBlue = false;
    let supervisor = "";
    getTempo();
    getImagem();

    /**
     * @param {{ target: { value: any; }; }} e
     */
     function blockForbiddenChars(e) {
        let value = e.target.value;
        e.target.value = preSanitize(value);
    }

    /**
     * @param {string} input
     */
    function preSanitize(input) {
        const allowedChars = /[0-9]/;
        const sanitizedOutput = input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
        return sanitizedOutput;
    }

    async function getTempo() {
        const res = await fetch(urlString);
        tempodePro = await res.json();
        tempodePro = 6500000;
        tempoMax = 600000
        // console.log("tempo", tempodePro);
        // tempodePro = 600000

        // if (tempodePro === "erro no tempo") {
        //     tempoMax = 60000;
        // }

        // if (tempoMax === null) {
        //     tempoMax = 60000;
        // }
        //return tempodePro;
    }

    let tempoDaBarra = setInterval(() => {
        if (tempoMax <= 0) {
            shwowSuper = true;
            showRed = true;
            showGreen = false;
        } else {
            let menorFif = (Number(50) * Number(tempoMax)) / Number(100);
            let maiorFif = (Number(75) * Number(tempoMax)) / Number(100);
            let excedido = (Number(100) * Number(tempoMax)) / Number(100);
            tempoDecorrido++;
            if (tempoDecorrido <= menorFif) {
                showRed = false;
                showBlue = false;
                shwowSuper = false;
            }
            if (tempoDecorrido >= menorFif && tempoDecorrido <= maiorFif) {
                showGreen = false;
                showBlue = true;
                showRed = false;
                shwowSuper = false;
            }
            if (tempoDecorrido >= maiorFif) {
                showRed = true;
                showGreen = false;
                showBlue = false;
            }
            if (tempoDecorrido >= excedido) {
                shwowSuper = true;
                showGreen = false;
            } else {
                shwowSuper = false;
            }
        }
    }, 1000);

    async function getImagem() {
        const res = await fetch(url);
        imagem = await res.json();
        //return imagem;
    }

    const doPostSuper = async () => {
        const headers = new Headers();
        const res = await fetch(supervisorApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                supervisor: supervisor,
            }),
        }).then((res) => res.json());
        if (res.message === "supervisor encontrado") {
            shwowSuper = false;
            clearInterval(tempoDaBarra);
        }
    };

    let resultPromises = Promise.all([getImagem, getTempo, tempoDaBarra]);
</script>

<div class="content">
    {#if shwowSuper === true}
        <div class="fundo">
            <div class="timeOver">
                <h3>Tempo Excedido</h3>
                <form action="api/v1/apontar" method="POST" />
                <p>Insira um supervisor para continuar</p>
                <input
                    autofocus
                    tabindex="8"
                    bind:value={supervisor}
                    on:input={blockForbiddenChars}
                    name="supervisor"
                    id="supervisor"
                    type="text"
                />

                <p
                    tabindex="9"
                    on:keypress={doPostSuper}
                    on:click={doPostSuper}
                >
                    Confirma
                </p>
            </div>
        </div>
    {/if}
    {#await resultPromises}
        <div class="imageLoader" id="imageLoader">
            <div class="loader">
                <img src={imageLoader} alt="" />
            </div>
        </div>
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

        <!-- {#if resultPromises} -->
        <img class="img" src={String(imagem.key)} alt="" />
        <!-- {/if} -->
    {/await}
</div>

<style>
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
    .imageLoader {
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
        border-radius: 4px 0px 0px 4px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
    }
    div {
        margin: 0%;
        padding: 0%;
    }
    .content {
        margin: 0%;
        padding: 0%;
    }
    .timeOver {
        color: white;
        background-color: black;
        width: 500px;
        height: 250px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 3px;
        z-index: 999999999999;
    }
    input {
        border-radius: 3px;
    }
    .fundo {
        position: fixed;
        margin: 0%;
        padding: 0%;
        top: 0;
        left: 0;
        background-color: rgba(17, 17, 17, 0.618);
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        z-index: 89999999;
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
        height: 270px;
        border-radius: 3px;
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
