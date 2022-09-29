<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    export let Subtitle = "DESENHO";
    let zoomNumber = 400;
    let rotation = 0;
    let imagemBack = [];

    let urlString = `/api/v1/desenho?=imagemBack${imagemBack}`;

    async function getIMAGEM() {
        const res = await fetch(urlString);
        imagemBack = await res.json();
        return imagemBack;
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
    1;

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
        <button type="button" class="sideButton" on:click={right}
            >DIREITA</button
        >
        <button type="button" class="sideButton" on:click={left}
            >ESQUERDA</button
        >
        <button type="button" class="sideButton" on:click={zoomIn}
            >ZOOM +</button
        >
        <button type="button" class="sideButton" on:click={zoomOut}
            >ZOOM -</button
        >
        <button type="button" class="sideButton" on:click={print}
            >IMPRIMIR</button
        >
    </div>

    <div class="newDiv">
        {#each imagemBack as column}
            {#if imagemBack.length > 0}
                <img  media="print" id="img" class="img" src={column} alt="" />
            {:else}
                <h3>NÃO HÁ DESENHO PARA EXIBIR</h3>
            {/if}
        {/each}
    </div>
</main>

<style>
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
    div {
        margin: 5%;
        display: flex;
        flex-direction: column;
    }
    .main {
        margin: 1%;
    }
    .subtitle {
        margin: 1%;
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
        margin: 0%;
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

    @media screen and (max-width: 550px) {
        .subtitle {
            font-size: 20px;
        }
        #right {
            width: 48px;
            height: 20px;
            font-size: 7px;
        }
        #left {
            width: 48px;
            height: 20px;
            font-size: 7px;
        }
        #zoomIn {
            width: 55px;
            height: 20px;
            font-size: 7px;
        }
        #zoomOut {
            width: 55px;
            height: 20px;
            font-size: 7px;
        }
        #print {
            width: 48px;
            height: 20px;
            font-size: 7px;
        }
        button {
            margin: 1%;
        }
    }

    @media screen and (min-width: 551px) {
        .subtitle {
            font-size: 22px;
        }
        #right {
            width: 50px;
            height: 20px;
            font-size: 7px;
        }
        #left {
            width: 50px;
            height: 20px;
            font-size: 7px;
        }
        #zoomIn {
            width: 55px;
            height: 20px;
            font-size: 7px;
        }
        #zoomOut {
            width: 55px;
            height: 20px;
            font-size: 7px;
        }
        #print {
            width: 50px;
            height: 20px;
            font-size: 7px;
        }
        button {
            margin: 1%;
        }
    }

    @media screen and (min-width: 860px) {
        .subtitle {
            font-size: 25px;
        }
        #right {
            width: 55px;
            height: 20px;
            font-size: 7px;
        }
        #left {
            width: 55px;
            height: 20px;
            font-size: 7px;
        }
        #zoomIn {
            width: 55px;
            height: 22px;
            font-size: 7px;
        }
        #zoomOut {
            width: 55px;
            height: 22px;
            font-size: 7px;
        }
        #print {
            width: 55px;
            height: 20px;
            font-size: 7px;
        }
        button {
            margin: 1%;
        }
    }
    @media screen and (min-width: 1000px) {
        .subtitle {
            font-size: 30px;
        }
        #right {
            width: 60px;
            height: 20px;
            font-size: 8px;
        }
        #left {
            width: 60px;
            height: 20px;
            font-size: 8px;
        }
        #zoomIn {
            width: 60px;
            height: 22px;
            font-size: 8px;
        }
        #zoomOut {
            width: 60px;
            height: 22px;
            font-size: 8px;
        }
        #print {
            width: 60px;
            height: 20px;
            font-size: 8px;
        }
        button {
            margin: 1%;
        }
    }
    @media screen and (min-width: 1200px) {
        .subtitle {
            font-size: 40px;
        }
        #right {
            width: 65px;
            height: 20px;
            font-size: 8px;
        }
        #left {
            width: 65px;
            height: 20px;
            font-size: 8px;
        }
        #zoomIn {
            width: 65px;
            height: 22px;
            font-size: 8px;
        }
        #zoomOut {
            width: 65px;
            height: 22px;
            font-size: 8px;
        }
        #print {
            width: 65px;
            height: 20px;
            font-size: 8px;
        }
        button {
            margin: 1%;
        }
    }
    @media screen and (min-width: 1400px) {
        .subtitle {
            font-size: 50px;
        }
        #right {
            width: 80px;
            height: 20px;
            font-size: 10px;
        }
        #left {
            width: 80px;
            height: 20px;
            font-size: 10px;
        }
        #zoomIn {
            width: 80px;
            height: 22px;
            font-size: 10px;
        }
        #zoomOut {
            width: 80px;
            height: 22px;
            font-size: 10px;
        }
        #print {
            width: 80px;
            height: 20px;
            font-size: 10px;
        }
        button {
            margin: 1%;
        }
    }

    @media screen and (min-width: 1600px) {
        .subtitle {
            font-size: 55px;
        }
        #right {
            width: 90px;
            height: 28px;
            font-size: 15px;
        }
        #left {
            width: 90px;
            height: 28px;
            font-size: 15px;
        }
        #zoomIn {
            width: 100px;
            height: 30px;
            font-size: 15px;
        }
        #zoomOut {
            width: 100px;
            height: 30px;
            font-size: 15px;
        }
        #print {
            width: 90px;
            height: 28px;
            font-size: 15px;
        }
        button {
            margin: 1%;
        }
    }
</style>
