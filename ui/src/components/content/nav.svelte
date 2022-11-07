<script>
    // @ts-nocheck
    let imageLoader = "/images/axonLoader.gif";
    import Breadcrumb from "../breadcrumb/breadcrumb.svelte";
    import breadFer from "../breadcrumb/breadcrumb.svelte";

    import badFeed from "../content/feed.svelte";
    import reworkFeed from "../content/feed.svelte";
    import missingFeed from "../content/feed.svelte";
    import ruins from "../content/feed.svelte";
    import retrabalhar from "../content/feed.svelte";
    import faltante from "../content/feed.svelte";
    import Title from "../title/title.svelte";
    let apiMotivoParada = "api/v1/motivoParada";
    let postParada = `/api/v1/postParada`;
    let dadosOdf = [];
    let dados = [];
    let value = "";
    let showmodal = false;
    let resultCall = callMotivo();
    let showMaqPar = false;
    //let ferr = localStorage.getItem("breadFer");
    //import breadFer from "/src/routes/ferramenta.svelte";
    //import Ferramenta from "src/routes/ferramenta.svelte"
    import Ferramenta from "/src/routes/ferramenta.svelte";
    
    const getMissingFeed = async () => {
        document.getElementById("faltante").style.display = "block";
        document.getElementById("missingFeed").style.display = "block";
        document.getElementById("retrabalhar").style.display = "none";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
    };

    const getReworkFeed = async () => {
        document.getElementById("faltante").style.display = "none";
        document.getElementById("retrabalhar").style.display = "block";
        document.getElementById("reworkFeed").style.display = "block";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
    };

    const getParcial = async () => {
        document.getElementById("faltante").style.display = "none";
        document.getElementById("retrabalhar").style.display = "none";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
    };
    function parada() {
        if (showmodal === false) {
            showmodal = true;
        } else {
            showmodal = false;
        }
    }

    function closeConfirm() {
        showMaqPar = false;
        showmodal = false;
        window.location.href = `/#/codigobarras`;
    }

    function closePop() {
        showMaqPar = false;
        if (showmodal === false) {
            showmodal = true;
        } else {
            showmodal = false;
        }
    }
    async function callMotivo() {
        const res = await fetch(apiMotivoParada);
        dados = await res.json();
        //console.log('dados Nav', dados);
    }

    const confirm = async () => {
        const headers = new Headers();
        const res = await fetch(postParada, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                value: value,
            }),
        }).then((res) => res.json());
        if (res.message === "maquina parada com sucesso") {
            showMaqPar = true;
            showmodal = false
        }
    };

</script>

<main>
    <!-- <Ferramenta breadFer = true /> -->
    <!-- //<BreadFer -->
    {#if breadFer === true}
        <nav class="breadcrumb" aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="/#/ferramenta">Ferramentas</a>
                </li>
            </ol>
        </nav>
    {/if}
    <!-- <Ferramenta breadFer === true /> -->

    <Title />

    <ul class="nav2">
        <li>Parcial</li>
    </ul>

    {#await resultCall}
        <div class="imageLoader">
            <div class="loader">
                <img src={imageLoader} alt="" />
            </div>
        </div>
    {:then item}
        {#if showmodal === true}
            <div class="modalBackground" >
                <div class="itensInsideModal">
                    <div class="closePopDiv">
                        <button
                            class="btnPop"
                            id="closePop"
                            on:keypress={closePop}
                            on:click={closePop}>FECHAR</button
                        >
                    </div>

                    <div class="modalContent">
                        <h2 class="modalTitle">Motivo da Parada</h2>
                        <div class="optionsBar">
                            <select autofocus tabindex="10" bind:value>
                                {#each dados as item}
                                    <option>{item}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="confirmPopDiv">
                            <button
                                class="btnPop"
                                id="confirmPop"
                                tabindex="11"
                                on:keypress={confirm}
                                on:click={confirm}
                            >
                                CONFIRMAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    {/await}

    {#if showMaqPar === true}
            <div class="modalBackground" >
                <div class="confirmationModal">
                    <div class="onlyConfirmModalContent">
                        <h2 class="modalTitle">Maquina Parada</h2>
                        <div class="onlyConfirmPop">
                            <button
                                class="btnPopConfirm"
                                id="confirmPop"
                                tabindex="11"
                                on:keypress={closeConfirm}
                                on:click={closeConfirm}
                            >
                                CONFIRMAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    <div class="nav">
        <button
            on:click={getMissingFeed}
            on:keypress={getMissingFeed}
            type="button"
            class="sideButton"
            name="missing"
            >Faltante
        </button>
        <button
            on:click={getReworkFeed}
            on:keypress={getReworkFeed}
            type="button"
            class="sideButton"
            name="rework"
            >Retrabalhar
        </button>
        <a class="out" href="/#/rip/"
            ><button type="button" class="sideButton">Inspeção</button></a
        >
        <a class="out" href="/#/historico/"
            ><button type="button" class="sideButton"> Historico </button>
        </a>
        <button
            type="button"
            class="sideButton"
            on:click={parada}
            on:keypress={parada}
        >
            Parada
        </button>
        <a class="out" href="/#/desenho/"
            ><button type="button" class="sideButton">Desenho</button></a
        >
    </div>
</main>

<style>
    .confirmationModal{
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 460px;
        height: 225px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
    }
    .onlyConfirmModalContent{
        margin-top: 50px;
        margin-bottom: 0%;
        margin-left: 25px;
        margin-right: 0%;
        padding: 0%;

    }
    .onlyConfirmPop{
        justify-content: right;
        margin-right: 1%;
        align-items: right;
        text-align: right;
    }
    .btnPopConfirm{
        border: none;
        background-color: transparent;
        color: white;
    }
    .modalContent {
        margin-left: 25px;
        margin-top: 0%;
        margin-bottom: 0%;
        margin-right: 0%;
    }
    button {
        letter-spacing: 0.5px;
        width: fit-content;
        height: 28px;
    }
    .optionsBar {
        margin-bottom: 10px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
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
    .closePopDiv {
        font-size: 12px;
        margin-right: 2%;
        margin-top: 2%;
        padding: 0%;
        justify-content: right;
        align-items: right;
        text-align: right;
    }
    .confirmPopDiv {
        font-size: 16px;
        margin: 0%;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
    }
    .breadcrumb {
        margin-top: 5px;
        margin-left: 0%;
        margin-bottom: 0%;
        text-decoration: underline;
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
    }
    .btnPop {
        margin: 0%;
        padding: 0%;
        background-color: transparent;
        border-radius: 5px;
        opacity: 0.5;
        color: white;
        border: none;
    }
    .btnPop:hover {
        transition: 1s;
        opacity: 1;
    }

    h2 {
        font-size: 55px;
        margin: 0px, 0px, 0px, 0px;
        padding: 0px;
        width: 450px;
        align-items: left;
        text-align: left;
        justify-content: left;
        display: flex;
    }
    select {
        width: 350px;
        height: 25px;
        background-color: #252525;
        border-radius: 5px;
        color: #fff;
    }
    option {
        font-size: 18px;
        background-color: #252525;
    }

    .modalBackground {
        transition: 1s;
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
        z-index: 999999999999999999999999999999;
    }
    .itensInsideModal {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 625px;
        height: 300px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
    }
    .out {
        text-decoration: none;
        outline: none;
    }
    a {
        text-decoration: none;
        outline: none;
    }
    a:focus {
        text-decoration: none;
        outline: none;
    }
    a:hover {
        text-decoration: none;
        outline: none;
    }
    .sideButton {
        outline: none;
        margin: 0%;
        padding: 0%;
        font-size: 14px;
        width: 120px;
        height: 35px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 3px;
        background-color: transparent;
        border: none;
        /* border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4); */
        letter-spacing: 1px;
    }

    .sideButton:hover {
        outline: none;
        cursor: pointer;
        background-color: black;
        color: white;
        transition: 1s;
    }
    .nav {
        margin: 0%;
        padding: 0%;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        background-color: transparent;
        border: none;
        /* border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4); */
    }

    @media screen and (max-width: 500px) {
        .nav2 {
            display: none;
        }
        .nav2 {
            display: none;
        }
    }
    @media screen and (min-width: 501px) {
        .nav2 {
            display: none;
        }
    }

    @media screen and (max-width: 820px) {
        .nav {
            display: none;
        }
        .nav2 {
            display: none;
        }
    }
    @media screen and (min-width: 821px) {
        .nav {
            margin-bottom: 15px;
            border-radius: 3px;
        }
        .nav2 {
            display: none;
        }
    }
</style>
