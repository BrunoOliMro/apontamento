<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    export let Subtitle = "DESENHO";
    let zoomNumber = 400;
    let rotation = 0;
    let imagemBack = [];
    let urlString = `/api/v1/desenho?`;

    async function getIMAGEM() {
        const res = await fetch(urlString);
        imagemBack = await res.json();
    }

    let resultado = getIMAGEM();

    function right() {
        rotation += 90;
        document.getElementById("img").style.transition = "all 1s";
        document.getElementById(
            "img"
        ).style.transform = `rotate(${rotation}deg)`;
    }

    function left() {
        rotation -= 90;
        document.getElementById("img").style.transition = "all 1s";
        document.getElementById(
            "img"
        ).style.transform = `rotate(${rotation}deg)`;
    }

    function zoomIn() {
        var img = document.getElementById("img");
        var width = img.clientWidth;
        img.style.width = width + zoomNumber + "px";
    }

    function zoomOut() {
        var img = document.getElementById("img");
        var width = img.clientWidth;
        img.style.width = width - zoomNumber + "px";
    }
    function print() {
        window.print();
    }
</script>

<main class="main">
    <div class="breadCrumb">
        <Breadcrumb />
    </div>
    <div id="subtitle" class="subtitle">{Subtitle}</div>
    <div id="buttons">
        <button
            tabindex="1"
            type="button"
            class="sideButton"
            on:click={right}>DIREITA</button
        >
        <button tabindex="2" type="button" class="sideButton" on:click={left} on:keypress={left}
            >ESQUERDA</button
        >
        <button tabindex="3" type="button" class="sideButton" on:click={zoomIn} on:keypress={left}
            >ZOOM +</button
        >
        <button tabindex="4" type="button" class="sideButton" on:click={zoomOut} on:keypress={left}
            >ZOOM -</button
        >
        <button tabindex="5" type="button" class="sideButton" on:click={print} on:keypress={left}
            >IMPRIMIR</button
        >
    </div>

    <div class="newDiv">
        {#await resultado}
            <div>AGUARDE...</div>
        {:then item}
            <div class="frame">
                {#each imagemBack as column}
                    {#if imagemBack.length > 0}
                        <img
                            media="print"
                            id="img"
                            class="img"
                            src={column}
                            alt=""
                        />
                    {/if}
                {/each}
            </div>
        {/await}
    </div>

    <!-- {#if imagemBack == "/images/sem_imagem.gif"}
        <h3>Não existe imagem</h3>
    {/if} -->
</main>

<style>
    .frame {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .sideButton {
        margin: 1%;
        padding: 0%;
        font-size: 13px;
        width: 150px;
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

    /* .main {
        margin: 1%;
    } */
    .subtitle {
        margin: 0%;
        padding: 0%;
        font-size: 30px;
        display: flex;
        justify-content: center;
    }
    .newDiv {
        margin: 0%;
        padding: 0%;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
    }
    .img {
        display: flex;
        min-width: 10%;
        max-width: 90%;
        border-radius: 3px;
        margin: 1%;
        padding: 0%;
    }

    #buttons {
        margin: 0%;
        padding: 0%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .breadCrumb {
        margin-left: 1%;
        margin-top: 5px;
    }
    button {
        margin: 1%;
    }
    @media print {
        #buttons {
            display: none;
        }
        .breadCrumb {
            display: none;
        }
        .subtitle {
            display: none;
        }
        .img {
            max-width: 100%;
        }
    }

    /* @media screen and (max-width: 550px) {
        .subtitle {
            font-size: 20px;
        }
    }

    @media screen and (min-width: 551px) {
        .subtitle {
            font-size: 22px;
        }
    }

    @media screen and (min-width: 860px) {
        .subtitle {
            font-size: 25px;
        }
    }
    @media screen and (min-width: 1000px) {
        .subtitle {
            font-size: 30px;
        }
    }
    @media screen and (min-width: 1200px) {
        .subtitle {
            font-size: 40px;
        }
    }
    @media screen and (min-width: 1400px) {
        .subtitle {
            font-size: 50px;
        }
    }

    @media screen and (min-width: 1600px) {
        .subtitle {
            font-size: 55px;
        }
    } */
</style>
