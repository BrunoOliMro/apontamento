<script>
    // @ts-nocheck
    import ModalConfirmation from "../modal/modalConfirmation.svelte";
    import blockForbiddenChars from "../../routes/presanitize";
    let searchIcon = `/images/search.png`;
    let imageLoader = `/images/axonLoader.gif`;
    let supervisorApi = `/api/v1/supervisor`;
    let urlString = `/api/v1/status`;
    let url = `/api/v1/imagem`;
    let shwowSuper = false;
    let showGreen = true;
    let showRed = false;
    let tempoMax = null;
    let showBlue = false;
    let imagem = [];
    let prodTime = [];
    let supervisor = "";
    let modalMessage = "";
    let tempoDecorrido = 0;

    getTempo();
    getImagem();

    async function getTempo() {
        const res = await fetch(urlString);
        prodTime = await res.json();
        if (prodTime.message === "Algo deu errrado") {
            modalMessage = "Algo deu errado";
        }
        tempoMax = prodTime;

        if (!tempoMax || tempoMax.message === "Not found") {
            tempoMax = 600000;
        }
    }

    let tempoDaBarra = setInterval(() => {
        let menorFif = (Number(50) * Number(tempoMax)) / Number(100);
        let maiorFif = (Number(75) * Number(tempoMax)) / Number(100);
        let excedido = (Number(100) * Number(tempoMax)) / Number(100);

        tempoDecorrido++;

        if (tempoDecorrido <= menorFif) {
            showRed = false;
            showBlue = false;
            shwowSuper = false;
            showGreen = true;
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
            showRed = true;
        } else {
            shwowSuper = false;
        }

        if (tempoMax <= 0) {
            shwowSuper = true;
            showRed = true;
            //showGreen = false;
        }

        if (tempoMax === null) {
            showRed = true;
        }
    }, 1000);

    async function getImagem() {
        const res = await fetch(url);
        imagem = await res.json();
    }

    function checkForSuper(event) {
        if (event.key === "Enter" && supervisor.length >= 6) {
            doPostSuper();
        }
    }

    const doPostSuper = async () => {
        if (
            supervisor === "" ||
            supervisor === "0" ||
            supervisor === "00" ||
            supervisor === "000" ||
            supervisor === "0000" ||
            supervisor === "00000" ||
            supervisor === "000000"
        ) {
            supervisor = "";
            modalMessage = "Supervisor não encontrado";
        }

        if (supervisor.length > 5) {
            const headers = new Headers();
            const res = await fetch(supervisorApi, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supervisor: supervisor,
                }),
            }).then((res) => res.json());
            if (res.message === "Supervisor encontrado") {
                shwowSuper = false;
                clearInterval(tempoDaBarra);
            }
            if (res.message === "Supervisor não encontrado") {
                modalMessage = "Supervisor não encontrado";
                supervisor = "";
            }
        } else {
            supervisor = "";
            modalMessage = "Erro ao localizar supervisor";
        }
    };

    let resultPromises = Promise.all([getImagem, getTempo, tempoDaBarra]);

    function close() {
        modalMessage = "";
    }
</script>

{#if shwowSuper === true}
    <div class="modalBackground">
        <div class="confirmationModal">
            <div class="onlyConfirmModalContent">
                <h2 class="modalTitle">Tempo Excedido</h2>
                <h3 class="modalSubtitle">
                    Insira um supervisor para continuar
                </h3>

                <!-- on:input={Sanitize} -->
                <!-- autofocus -->
                <!-- tabindex="8" -->
                <input
                    autocomplete="off"
                    bind:value={supervisor}
                    on:keypress={checkForSuper}
                    on:input={blockForbiddenChars}
                    name="supervisor"
                    id="supervisor"
                    type="text"
                />
            </div>
        </div>
    </div>
{/if}

{#if modalMessage !== ""}
    <ModalConfirmation on:message={close} title={modalMessage} />
{/if}

<!-- {#if modalMessage === "Supervisor não encontrado" || modalMessage === "Erro ao localizar supervisor"}
{/if} -->

{#await resultPromises}
    <div class="imageLoader" id="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then itens}
    <div class="conj">
        {#if showGreen === true}
            <div class="green" id="tempoDecorrido" />
        {/if}
        {#if showBlue === true}
            <div class="blue" id="tempoDecorrido" />
        {/if}
        {#if showRed === true}
            <div class="red" id="tempoDecorrido" />
        {/if}
        <div class="containerIcon">
            <a class="out" href="/#/desenho/">
                <img class="iconSearch" src={searchIcon} alt="" />
            </a>
            <img class="img" src={String(imagem)} alt="" />
        </div>
    </div>
{/await}

<style>
    .containerIcon {
        position: relative;
        display: flex;
        justify-content: left;
        align-self: left;
        text-align: left;
        margin: 0%;
        padding: 0%;
    }
    .iconSearch {
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
    h2 {
        font-size: 32px;
    }
    input {
        border-radius: 12px;
        height: 40px;
        width: 378px;
    }
    .modalSubtitle {
        display: flex;
        flex-direction: column;
    }
    .modalBackground {
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
    .modalTitle {
        margin-left: 0px;
        margin-bottom: 25px;
        margin-right: 0px;
        margin-top: 0px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
    }
    .confirmationModal {
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
    .onlyConfirmModalContent {
        display: flex;
        flex-direction: column;
        margin-top: 25px;
        margin-bottom: 0%;
        margin-left: 25px;
        margin-right: 0%;
        padding: 0%;
    }
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
