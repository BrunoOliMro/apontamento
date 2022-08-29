<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    export let Subtitle = "DESENHO";
    let zoomNumber = 450
    let rotation = 0;
    let IMAGEM = [];

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/desenho?IMAGEM=${IMAGEM}`;
    async function getIMAGEM() {
        const res = await fetch(urlString);
        IMAGEM = await res.json();
        return IMAGEM;
    }

    let resultado = getIMAGEM();
    resultado.then(() => {
        const atributeSrcImg = IMAGEM[0].img;
        let divSelector = document.querySelector("div");
        let imgElement = document.createElement("img");
        divSelector.appendChild(imgElement);
        imgElement.setAttribute("src", atributeSrcImg);
        imgElement.setAttribute("alt", "ferramenta");
        imgElement.id = "some";
        imgElement.classList.add("some");
        imgElement.style.margin = "2%";
        imgElement.style.borderRadius = "3px";
        imgElement.style.alignItems = "center"
        imgElement.style.justifyContent = "center"
        imgElement.style.textAlign = "center"
    });

    function right() {
        rotation += 90;
        document.getElementById("some").style.transition = "all 1s";
        document.getElementById(
            "some"
        ).style.transform = `rotate(${rotation}deg)`;
    }

    function left() {
        rotation -= 90;
        document.getElementById("some").style.transition = "all 1s";
        document.getElementById(
            "some"
        ).style.transform = `rotate(${rotation}deg)`;
    }

    
    function zoomIn() {
        var img = document.getElementById("some");
        var width = img.clientWidth;
        img.style.width = width + zoomNumber + "px";
    }

    function zoomOut() {
        var img = document.getElementById("some");
            var width = img.clientWidth;
            img.style.width = (width - zoomNumber) + "px";
    }

    function print(){
        let myWindow = window.open()
        myWindow.close();
        myWindow.focus()
        myWindow.print();
    }
</script>

<main>
    <Breadcrumb />
    <div id="subtitle" class="subtitle">{Subtitle}</div>
    <button id="right" on:click={right}>DIREITA</button>
    <button id="left" on:click={left}>ESQUERDA</button>
    <button id="zoomIn" on:click={zoomIn}>ZOOM +</button>
    <button id="zoomOut" on:click={zoomOut}>ZOOM -</button>
    <button id="zoomOut" on:click={print}>IMPRIMIR</button>
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
</style>
