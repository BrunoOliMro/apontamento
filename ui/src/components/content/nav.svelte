<script>
    import badFeed from "../content/feed.svelte";
    import reworkFeed from "../content/feed.svelte";
    import missingFeed from "../content/feed.svelte";
    import ruins from "../content/feed.svelte";
    import retrabalhar from "../content/feed.svelte";
    import faltante from "../content/feed.svelte";
    import parcialFeed from "../content/feed.svelte";

    let urlStop = `/api/v1/parada`;
    let urlPause = `/api/v1/pause`;
    let dadosOdf = [];

    const getMissingFeed = async () => {
        document.getElementById("faltante").style.display = "block";
        document.getElementById("retrabalhar").style.display = "none";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
        document.getElementById("parcialFeed").style.display = "none";
    };

    const getReworkFeed = async () => {
        document.getElementById("faltante").style.display = "none";
        document.getElementById("retrabalhar").style.display = "block";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
        document.getElementById("parcialFeed").style.display = "none";
    };

    const getParcial = async () => {
        document.getElementById("faltante").style.display = "none";
        document.getElementById("retrabalhar").style.display = "none";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
        document.getElementById("parcialFeed").style.display = "block";
    };

    let showmodal = false;
    //let showBtnParcial = false;
    function returnValue() {
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

    async function pause() {
        const res = await fetch(urlPause);
        dadosOdf = await res.json();
    }

    function closePop() {
        if (showmodal === false) {
            showmodal = true;
        } else {
            showmodal = false;
        }
    }
</script>

<main>
    <ul class="nav2">
        <li>Parcial</li>
        <li>Faltante</li>
        <li>Retrabalhar</li>
        <li>Inspeção</li>
        <li>Historico</li>
        <li>Parada</li>
        <li>Desenho</li>
    </ul>
    <div class="nav">
        <button
            on:click={getParcial}
            type="button"
            class="sideButton"
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
        <button type="button" class="sideButton" on:click={returnValue}>
            Parada
        </button>

        <a class="out" href="/#/desenho/"
            ><button type="button" class="sideButton">Desenho</button></a
        >

        {#if showmodal === true}
            <div class="fundo">
                <div class="header">
                    <h2>Motivo da Parada</h2>
                    <h2 on:click={stop}>DOR</h2>
                    <h2 on:click={stop}>DOR</h2>
                    <h2 on:click={pause}>DOR</h2>
                    <h2 on:click={pause}>ESTUFADO</h2>
                    <h2 on:click={pause}>SONO</h2>
                    <p on:click={closePop}>Fechar</p>
                </div>
            </div>
        {/if}
    </div>
</main>

<style>
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
    ul {
        font-size: 20px;
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
    .btns {
        display: flex;
        flex-direction: column;
    }
    .sideButton {
        outline: none;
        margin: 1%;
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
        height: 10%;
        justify-content: space-between;
        align-items: center;
        text-align: center;
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
            margin-bottom: 2%;
        }
        .nav2 {
            display: none;
        }
    }
</style>
