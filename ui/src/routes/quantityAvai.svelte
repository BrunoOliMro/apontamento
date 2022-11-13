<script>
    let imageLoader = "/images/axonLoader.gif";
    let quantityAvailableProd;
    let urlString = `/api/v1/odfQtd`;
    let dadosOdf = [];
    let title = "Produzir";
    let result = getOdfData;

    async function getOdfData() {
        const res = await fetch(urlString);
        dadosOdf = await res.json();
        //console.log('linha 41', dadosOdf);
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
        <div class="write">
            <p>{title}</p>
            <div class="quantAvai">
                {quantityAvailableProd}
            </div>
        </div>
    </div>
{/await}

<style>
    .write {
        margin: 0%;
        /* padding: 0px 30px; */
        font-size: 52px;
        padding: 0%;
        height: fit-content;
        width: fit-content;
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
