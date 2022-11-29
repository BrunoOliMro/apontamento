<script>
    import ModalConfirmation from "../components/modal/modalConfirmation.svelte";
    const imageLoader = "/images/axonLoader.gif";
    const title = "Quantidade a produzir: ";
    let quantityAvailableProd;
    let dadosOdf = [];
    let odfDataRouter = `/api/v1/odfData`;
    const promiseResult = getOdfData();
    let errorMessage = ''

    async function getOdfData() {
        const res = await fetch(odfDataRouter);
        dadosOdf = await res.json();
        console.log("linha 14 /quantity/", dadosOdf);
        quantityAvailableProd = dadosOdf.valorMaxdeProducao;
        console.log('linha 15 /quantityAvailableProd/', quantityAvailableProd);
        if (quantityAvailableProd <= 0) {
            console.log("ubrwegubrugbrubvbr");
            quantityAvailableProd = 0;
            errorMessage = 'Quantidade a produzir inválida'
        }
    }

    function close (){
        errorMessage = ''
        window.location.href = "/#/codigobarras";
    }
</script>

{#await promiseResult}
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
{#if errorMessage === 'Quantidade a produzir inválida'}
    <ModalConfirmation on:message={close}/>
{/if}

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
