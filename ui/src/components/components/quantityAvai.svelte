<script>
    const imageLoader = "/images/axonLoader.gif";
    const title = "Quantidade liberada: ";
    let quantityAvailableProd;
    export let odfData;
    console.log('odffffffffff', odfData);

    if (!odfData.codData.data) {
        odfData.codData.data = "";
    } else {
        quantityAvailableProd = odfData.codData.data.odfSelecionada.QTDE_LIB;
    }
</script>

{#await odfData.codData.data}
    <div class="image-loader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then}
    <div>
        <div class="prod-area">
            {title}
            <p>{quantityAvailableProd}</p>
        </div>
    </div>
{/await}

<style>
    p {
        width: 50px;
        font-size: 20px;
        font-weight: bold;
        margin: 0%;
        padding: 0%;
    }
    .prod-area {
        border-radius: 6px;
        margin: 0%;
        padding: 0%;
        height: fit-content;
        width: 250px;
        display: flex;
        flex-direction: row;
        text-align: center;
        align-items: center;
        justify-content: center;
        border-color: #999999;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        letter-spacing: 1px;
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
    .image-loader {
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
</style>
