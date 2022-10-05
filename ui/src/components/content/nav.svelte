<script>
    import { onMount } from "svelte";
    import badFeed from "../content/feed.svelte";
    import reworkFeed from "../content/feed.svelte";
    import missingFeed from "../content/feed.svelte";
    import ruins from "../content/feed.svelte";
    import retrabalhar from "../content/feed.svelte";
    import faltante from "../content/feed.svelte";
    import parcialFeed from "../content/feed.svelte";

    let apiMotivoParada = "api/v1/motivoParada";
    let urlStop = `/api/v1/parada`;
    let urlPause = `/api/v1/pause`;
    let dadosOdf = [];
    let dados = [];

    const getMissingFeed = async () => {
        document.getElementById("faltante").style.display = "block";
        document.getElementById("retrabalhar").style.display = "none";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
        document.getElementById("parcialfeed").style.display = "none";
    };

    const getReworkFeed = async () => {
        document.getElementById("faltante").style.display = "none";
        document.getElementById("retrabalhar").style.display = "block";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
        document.getElementById("parcialfeed").style.display = "none";
    };

    const getParcial = async () => {
        document.getElementById("faltante").style.display = "none";
        document.getElementById("retrabalhar").style.display = "none";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
        document.getElementById("parcialfeed").style.display = "block";
    };

    let showmodal = false;
    function parada() {
        if (showmodal === false) {
            showmodal = true;
        } else {
            showmodal = false;
        }
    }

    async function stop() {
        const res = await fetch(urlStop);
        dadosOdf = await res.json();
    }

    function closePop() {
        if (showmodal === false) {
            showmodal = true;
        } else {
            showmodal = false;
        }
    }

    async function callMotivo() {
        const res = await fetch(apiMotivoParada);
        dados = await res.json();
        console.log(dados);
    }
    let resultCall = callMotivo();
</script>

<main>
    <ul class="nav2">
        <li>Parcial</li>
    </ul>
    <div class="nav">
        <button
            on:click={getParcial}
            type="button"
            class="sideButton"
            id="parcial"
            name="parcial"
            >Parcial
        </button>
        <button
            on:click={getMissingFeed}
            type="button"
            class="sideButton"
            name="missing"
            >Faltante
        </button>
        <button
            on:click={getReworkFeed}
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
        <button type="button" class="sideButton" on:click={parada}>
            Parada
        </button>
        <a class="out" href="/#/desenho/"
            ><button type="button" class="sideButton">Desenho</button></a
        >
        {#if showmodal === true}
            <div class="fundo">
                <div class="header">
                    <h2>Motivo da Parada</h2>
                    <div class="c">
                        <div class="dd">
                            <div class="dd-p"><span>Opções</span></div>
                            <input type="checkbox" />
                            <div class="dd-c">
                                {#each dados as item}
                                    <ul>
                                        <li><p href="#">{item}</p></li>
                                    </ul>
                                {/each}
                            </div>
                        </div>
                    </div>
                    <p on:click={closePop}>Fechar</p>
                </div>
            </div>
        {/if}
    </div>
</main>

<style>
    .dd-p {
        padding: 10px;
        background: black;
        position: relative;
        -webkit-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
        box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
        transition-duration: 0.2s;
        -webkit-transition-duration: 0.2s;
    }
    .dd input:after {
        content: "";
        width: 100%;
        height: 2px;
        position: absolute;
        display: block;
        background: #c63d0f;
        bottom: 0;
        left: 0;
        transform: scaleX(0);
        transform-origin: bottom left;
        transition-duration: 0.2s;
        -webkit-transform: scaleX(0);
        -webkit-transform-origin: bottom left;
        -webkit-transition-duration: 0.2s;
    }
    .dd input {
        top: 0;
        opacity: 0;
        display: block;
        padding: 0;
        margin: 0;
        border: 0;
        position: absolute;
        height: 100%;
        width: 100%;
    }
    .dd input:hover {
        cursor: pointer;
    }
    /* .dd input:hover ~ .dd-p {
        -webkit-box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.75);
        box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.75);
    } */
    .dd input:checked:after {
        transform: scaleX(1);
        -webkit-transform: scaleX(1);
    }
    .dd input:checked ~ .dd-c {
        transform: scaleY(1);
        -webkit-transform: scaleY(1);
    }
    /* .dd-p span {
        color: #c63d0f;
    } */
    .dd-c {
        display: block;
        position: absolute;
        background: black;
        height: auto;
        transform: scaleY(0);
        transform-origin: top left;
        transition-duration: 0.2s;
        -webkit-transform: scaleY(0);
        -webkit-transform-origin: top left;
        -webkit-transition-duration: 0.2s;
    }
    .dd-c ul {
        margin: 0;
        padding: 0;
        list-style-type: none;
    }
    .dd-c li {
        margin-bottom: 5px;
        word-break: keep-all;
        white-space: nowrap;
        display: block;
        position: relative;
    }
    p {
        display: block;
        position: relative;
        text-decoration: none;
        padding: 5px;
        background: black;
        color: white;
    }
    /* p:before {
        z-index: 0;
        content: "";
        position: absolute;
        display: block;
        height: 100%;
        width: 100%;
        -webkit-transition-duration: 0.2s;
        transition-duration: 0.2s;
        transform-origin: top left;
        -webkit-transform-origin: top left;
        background: black;
        top: 0;
        left: 0;
        transform: scaleX(0);
        -webkit-transform: scaleX(0);
    } */
    /* p, span {
        display: block;
        position: relative;
        -webkit-transition-duration: 0.2s;
        transition-duration: 0.2s;
    } */
    /* p:hover:before {
        transform: scaleX(1);
        -webkit-transform: scaleX(1);
    } */
    /* p, span:hover {
        color: white;
    } */

    /* #li:focus ~ li {
        background-color: red;
        transition: 1s;
    }

    #li:active ~ ul {
        visibility: hidden;
        opacity: 0;
    }
    #li {
        display: none;
    }
    #li:not(:active) ~ ul {
        opacity: 1;
        transition: 0.3s ease-in-out;
    } */

    main {
        display: flex;
        margin: 0%;
        padding: 0%;
        justify-content: left;
        text-align: left;
        align-items: left;
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
    .header {
        color: white;
        background-color: black;
        width: 500px;
        height: 350px;
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
