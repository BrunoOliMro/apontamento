<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    export let Subtitle = "DESENHO";
    let zoomNumber = 400;
    let rotation = 0;
    let imagemBack = [];

    let urlString = `/api/v1/desenho?imagemBack=${imagemBack}`;
    async function getIMAGEM() {
        const res = await fetch(urlString);
        imagemBack = await res.json();
        console.log(imagemBack);
        return imagemBack;
    }

    let resultado = getIMAGEM();
    const some = resultado.then(() => {
        const atributeSrcImg = imagemBack[0].img;
        let divSelector = document.querySelector("div");
        let imgElement = document.createElement("img");
        divSelector.appendChild(imgElement);
        imgElement.setAttribute("src", atributeSrcImg);
        imgElement.setAttribute("alt", "ferramenta");
        imgElement.id = "some";
        imgElement.classList.add("some");
        imgElement.style.margin = "2%";
        imgElement.style.borderRadius = "3px";
        imgElement.style.display = "flex";
        imgElement.style.alignItems = "center";
        imgElement.style.justifyContent = "center";
        imgElement.style.textAlign = "center";
        imgElement.style.overflowY = "hidden";
        imgElement.style.overflowX = "hidden";
        imgElement.style.maxWidth = "90%";
        imgElement.style.minWidth = "30%";
    });

    function right() {
        rotation += 90;
        document.getElementById("some").style.transition = "all 1s";
        document.getElementById(
            "some"
        ).style.transform = `rotate(${rotation}deg)`;
        document.getElementById("some").style.marginRight = "2%";
        document.getElementById("some").style.marginLeft = "2%";
    }

    function left() {
        rotation -= 90;
        document.getElementById("some").style.transition = "all 1s";
        document.getElementById(
            "some"
        ).style.transform = `rotate(${rotation}deg)`;
        document.getElementById("some").style.marginRight = "2%";
        document.getElementById("some").style.marginLeft = "2%";
    }
    1;

    function zoomIn() {
        var img = document.getElementById("some");
        var width = img.clientWidth;
        img.style.width = width + zoomNumber + "px";
        img.style.marginLeft = "2%";
        img.style.marginRight = "2%";
        img.style.display = "flex";
        img.style.justifyContent = "center";
        img.style.alignItems = "center";
        img.style.textAlign = "center";
    }

    function zoomOut() {
        var img = document.getElementById("some");
        var width = img.clientWidth;
        img.style.width = width - zoomNumber + "px";
        img.style.marginLeft = "2%";
        img.style.marginRight = "2%";
        img.style.display = "flex";
        img.style.justifyContent = "center";
        img.style.alignItems = "center";
        img.style.textAlign = "center";
    }

    function print() {
        let myWindow = window.open();
        myWindow.close();
        myWindow.focus();
        myWindow.print();
    }
</script>

<main>
    <Breadcrumb />
    <div id="subtitle" class="subtitle">{Subtitle}</div>
    <div id="buttons">
        <button id="right" on:click={right}>DIREITA</button>
        <button id="left" on:click={left}>ESQUERDA</button>
        <button id="zoomIn" on:click={zoomIn}>ZOOM +</button>
        <button id="zoomOut" on:click={zoomOut}>ZOOM -</button>
        <button id="print" on:click={print}>IMPRIMIR</button>
    </div>
</main>

<style>
    main {
        margin: 1%;
    }
    .subtitle {
        font-size: 30px;
        display: flex;
        justify-content: center;
    }

    #buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    @media screen and (max-width: 550px) {
        .subtitle {
            font-size: 25px;
        }
        #right {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #left {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomIn {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomOut {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #print {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
    }

    @media screen and (min-width: 551px) {
        .subtitle {
            font-size: 25px;
        }
        #right {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #left {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomIn {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomOut {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #print {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
    }

    @media screen and (min-width: 860px) {
        .subtitle {
            font-size: 25px;
        }
        #right {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #left {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomIn {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomOut {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #print {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
    }
    @media screen and (min-width: 1000px) {
        .subtitle {
            font-size: 25px;
        }
        #right {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #left {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomIn {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomOut {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #print {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
    }
    @media screen and (min-width: 1200px) {
        .subtitle {
            font-size: 30px;
        }
        #right {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #left {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomIn {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomOut {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #print {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
    }
    @media screen and (min-width: 1400px) {
        .subtitle {
            font-size: 30px;
        }
        #right {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #left {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomIn {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomOut {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #print {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
    }

    @media screen and (min-width: 1600px) {
        .subtitle {
            font-size: 30px;
        }
        #right {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #left {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomIn {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #zoomOut {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
        #print {
            width: 50px;
            height: 20px;
            font-size: 5px;
        }
    }
</style>
