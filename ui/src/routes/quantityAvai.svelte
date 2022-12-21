<script>
    import ModalConfirmation from "../components/modal/modalConfirmation.svelte";
    const imageLoader = "/images/axonLoader.gif";
    const odfDataRouter = `/api/v1/odfData`;
    const title = "Quantidade liberada: ";
    let quantityAvailableProd;
    let dadosOdf = [];
    let message = "";
    const promiseResult = getOdfData();

    async function getOdfData() {
        const res = await fetch(odfDataRouter);
        dadosOdf = await res.json();
        console.log("dados linha 14 /Quantity.svekte/", dadosOdf);
        if (dadosOdf) {
            if (
                dadosOdf.odfSelecionada.QTDE_LIB > 0 &&
                dadosOdf.message === "Success"
            ) {
                quantityAvailableProd = dadosOdf.odfSelecionada.QTDE_LIB;
            } else if (dadosOdf.message !== "") {
                message = dadosOdf.message;
            } else {
                return (message = "Algo deu errado");
            }
        }
    }

    function close() {
        message = "";
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

{#if message !== "" && message !== "Success"}
    <ModalConfirmation on:message={close} title={message} />
{/if}

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
