<script>
    import badFeed from "../content/feed.svelte";
    import reworkFeed from "../content/feed.svelte";
    import missingFeed from "../content/feed.svelte";
    import ruins from "../content/feed.svelte";
    import retrabalhar from "../content/feed.svelte";
    import faltante from "../content/feed.svelte";
    import parcialFeed from "../content/feed.svelte"

    let urlStop = `/api/v1/parada`;
    let urlPause = `/api/v1/pause`;
    let dadosOdf = []

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

    const getParcial = async () =>{
        document.getElementById("faltante").style.display = "none";
        document.getElementById("retrabalhar").style.display = "none";
        document.getElementById("ruins").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
        document.getElementById("parcialFeed").style.display = "block";
    }


    let showmodal = false;
    //let showBtnParcial = false;
    function returnValue() {
        if (showmodal === false) {
            showmodal = true;
        } else {
            showmodal = false;
        }
    }

    async function stop(){
        const res = await fetch(urlStop);
        dadosOdf = await res.json();
    }

    async function pause(){
        const res = await fetch(urlPause);
        dadosOdf = await res.json();
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
        <a href="/#/rip/"
            ><button type="button" class="sideButton">Inspeção</button></a
        >
        <a href="/#/historico/"
            ><button type="button" class="sideButton"> Historico </button>
        </a>
        <button type="button" class="sideButton" on:click={returnValue}>
            Parada
        </button>

        <a href="/#/desenho/"
            ><button type="button" class="sideButton">Desenho</button></a
        >

        {#if showmodal === true}
        <div class="li">
            <h2>Motivo da Parada</h2>
            <div class="btns">
                <button on:click={stop}>DOR DE BARRIGA</button>
                <button on:click={stop}>CAGANEIRA</button>
                <button on:click={pause}>FEIJOADA DEMAIS</button>
                <button on:click={pause}>ESTUFADO</button>
                <button on:click={pause}>SONO</button>

            </div>
        </div>
        {/if}
    </div>
</main>

<style>
    .btns{
        display: flex;
        flex-direction: column;
    }
    .li {
        display: inline-block;
        position: fixed; /* Stay in place */
        left: 40%;
        top: 25%;
        width: 350px; /* Full width */
        height: 230px; /* Full height */
        background-color:black; /* Fallback color */
        color: white;
        border-radius: 3px;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .sideButton {
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
