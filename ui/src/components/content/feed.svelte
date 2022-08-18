<script>
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
    let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);
    let goodFeed = "";
    let badFeed = "";

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/apontamento?NUMERO_ODF=${NUMERO_ODF}&CODIGO_MAQUINA=${CODIGO_MAQUINA}&NUMERO_OPERACAO=${NUMERO_OPERACAO}`;
    let resultado = getOdfData();
    async function getOdfData() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        return odfData;
    }

    const doPost = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        const res = fetch(`/api/v1/apontar`, {
            method: "POST",
            body: JSON.stringify({
                goodFeed: goodFeed,
                badFeed: badFeed,
            }),
            headers,
        })
    };

</script>

<main class="align-self-center">
    {#await resultado}
        <div>...</div>
    {:then dadosOdf}
        <form
            action="/api/v1/apontar"
            method="POST"
            type="submit"
            on:input={doPost}
        >
            <div>Produzir {dadosOdf[0].QTDE_ODF[0]}</div>
            <div>Boas <input id="goodFeed" name="goodFeed" /> {goodFeed}</div>
            <div>Ruins<input id="badFeed" name="badFeed" /> {badFeed}</div>
            <button on:click={doPost} class="btn btn-primary">Apontar</button>
        </form>
    {/await}
</main>

<style>
    main {
        font-size: 55px;
        justify-content: center;
        align-items: center;
        text-align: center;
        display: flex;
        font-weight: bold;
    }

    input {
        width: 200px;
    }

    form {
        display: flex;
    }

    div {
        margin: 2%;
    }
</style>
