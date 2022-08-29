<script>
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
    let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);
    let goodFeed;
    let badFeed;
    let missingFeed;
    let reworkFeed;
    import paradaMaq from "../content/nav.svelte"

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
        const res = fetch(`/api/v1/apontar`, {
            method: "POST",
            body: JSON.stringify({
                goodFeed: goodFeed,
                badFeed: badFeed,
                reworkFeed: reworkFeed,
                missingFeed: missingFeed,
            }),
            headers,
        });
    };
</script>

<main class="align-self-center">
    {#await resultado}
        <div>...</div>
    {:then dadosOdf}
        <form action="/api/v1/apontar" method="POST">
            <div>Produzir {dadosOdf[0].QTDE_ODF[0]}</div>
            <div id="goodFeed">
                Boas
                <input id="goodFeed" name="goodFeed" />
            </div>
            <div id="some" name="some">
                Ruins
                <input id="badFeed" name="badFeed" />
            </div>
            <div id="retrabalhar">
                Retrabalhar
                <input type="text" id="reworkFeed" name="reworkFeed" />
            </div>
            <div id="faltante">
                Faltante
                <input type="text" id="missingFeed" name="missingFeed" />
            </div>
            <button on:click={doPost} type="submit" class="btn btn-primary"
                >Apontar</button
            >
            <div id="popUp">MOTIVO DA PARADA</div>
            <ul id="popUp1">
                <li id="close">X</li>
                <li id="popUp2">banheiro</li>
                <li id="popUp3">troca de turno</li>
                <li id="popUp4">alguma coisa</li>
                <li id="popUp5">supervisor</li>
            </ul>
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

    #retrabalhar {
        display: none;
    }

    #faltante {
        display: none;
    }
    #popUp {
        width: 200px;
        height: 200px;
        padding: 20px;
        margin: 0px;
        background-color: azure;
        display: none;
        font-size: 20px;
        position: fixed;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    #popUp1 {
        background-color: azure;
        display: none;
        font-size: 20px;
        position: fixed; 
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    #popUp2 {
        background-color: azure;
        display: none;
        font-size: 20px;
        position: fixed;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    #popUp3 {
        background-color: azure;
        display: none;
        font-size: 20px;
        position: fixed;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    #popUp4 {
        background-color: azure;
        display: none;
        font-size: 20px;
        position: fixed;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    #popUp5 {
        background-color: azure;
        display: none;
        font-size: 20px;
        position: fixed;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
</style>
