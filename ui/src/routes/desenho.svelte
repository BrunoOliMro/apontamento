<script>
    // @ts-nocheck
    const imageLoader = "/images/axonLoader.gif";
    const back = "images/icons8-go-back-24.png";
    const Subtitle = "DESENHO";
    const zoomNumber = 400;
    const urlString = `/api/v1/drawing`;
    const resultado = getIMAGEM();
    let rotation = 0;
    let imagemBack = [];
    let imagemMsg = "";
    let selected;
    let ar = []
    let img = `img`

    // function selectPic(e) {
    //     selected = e.target.src.split("000")[1];
    //     console.log('selected', e.target);
    // }

    async function getIMAGEM() {
        const res = await fetch(urlString);
        imagemBack = await res.json();
        if (imagemBack.message === "dados não conferem conferidos") {
            imagemMsg = "dados não conferem conferidos";
        }
    }

    function right() {
        rotation += 90;
        document.getElementById(`img`).style.transition = "all 1s";
        document.getElementById(`img`).style.transform = `rotate(${rotation}deg)`;
    }

    function left() {
        rotation -= 90;
        document.getElementById(`img`).style.transition = "all 1s";
        document.getElementById(`img`).style.transform = `rotate(${rotation}deg)`;
    }

    function zoomIn() {
        var img = document.getElementById(`img`);
        var width = img.clientWidth;
        img.style.width = width + zoomNumber + "px";
    }

    function zoomOut() {
        
        var img = document.getElementById(`img`);
        var width = img.clientWidth;
        img.style.width = width - zoomNumber + "px";
    }
    function print() {
        window.print();
    }
</script>

<main class="main">
    <div class="breadCrumb">
        <!-- <Breadcrumb /> -->
        <nav class="breadcrumb" aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="/#/codigobarras/apontamento"
                        ><img src={back} alt="" />Apontamento</a
                    >
                </li>
            </ol>
        </nav>
    </div>
    <div id="subtitle" class="subtitle">{Subtitle}</div>
    <div id="buttons">
        <!-- svelte-ignore a11y-positive-tabindex -->
        <button tabindex="1" type="button" class="sideButton" on:click={right}
            >DIREITA</button
        >
        <button
            tabindex="2"
            type="button"
            class="sideButton"
            on:click={left}
            on:keypress={left}>ESQUERDA</button
        >
        <button
            tabindex="3"
            type="button"
            class="sideButton"
            on:click={zoomIn}
            on:keypress={left}>ZOOM +</button
        >
        <button
            tabindex="4"
            type="button"
            class="sideButton"
            on:click={zoomOut}
            on:keypress={left}>ZOOM -</button
        >
        <button
            tabindex="5"
            type="button"
            class="sideButton"
            on:click={print}
            on:keypress={left}>IMPRIMIR</button
        >
    </div>

    <div class="newDiv">
        {#await resultado}
            <div class="imageLoader">
                <div class="loader">
                    <img src={imageLoader} alt="" />
                </div>
            </div>
        {:then item}
            <div class="frame">
                {#each imagemBack as img}
                    {#if imagemBack.length > 0}
                    <!-- on:click|preventDefault={selectPic} -->
                        <div id={img} >
                            <img
                                media="print"
                                class="img"
                                src={img}
                                id='img'
                                alt=""
                            />
                        </div>
                    {/if}
                {/each}
            </div>
        {/await}
    </div>

    {#if imagemMsg === "dados não conferem"}
        <h3>Dados não conferem</h3>
    {/if}
</main>

<style>
    a {
        font-size: 20px;
        color: #252525;
    }

    a:hover {
        opacity: 0.5;
        transition: all 1s;
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
        z-index: 999999999;
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
        z-index: 999999999999;
    }
    .frame {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .sideButton {
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 100px;
        height: 30px;
        border: none;
        background-color: white;
        border-color: #999999;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        letter-spacing: 1px;
        border-radius: 6px;
        color: black;
    }

    .sideButton:hover {
        outline: none;
        opacity: 0.8;
        transition: all 1s;
        background-color: white;
        color: black;
    }

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
        min-width: 50%;
        /* max-width: 90%; */
        border-radius: 3px;
        margin: 10px;
        padding: 0%;
        justify-content: center;
        align-items: center;
        text-align: center;
        flex-direction: row;
    }
    #img{
        margin: 0%;
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
        *{
            background: transparent;
            color: white;
        }

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
            display: block;
            min-width: 100%;
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
