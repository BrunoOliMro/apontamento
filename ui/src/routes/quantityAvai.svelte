<script>
    let imageLoader = "/images/axonLoader.gif";
    let title = "Quantidade a produzir: ";
    let quantityAvailableProd;
    let dadosOdf = [];
    let urlString = `/api/v1/odf`;
    let result = getOdfData();

    async function getOdfData() {
        const res = await fetch(urlString);
        dadosOdf = await res.json();
        console.log('linha 41', dadosOdf);
        quantityAvailableProd = dadosOdf.valorMaxdeProducao;
        if (quantityAvailableProd <= 0) {
            quantityAvailableProd = 0;
        }
    }
</script>

{#await result}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then item}
    <div>
        <div class="prod-area">
                {title}
                <p>{quantityAvailableProd}</p>
        </div>
    </div>
{/await}

<style>
    p{
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
</style>
