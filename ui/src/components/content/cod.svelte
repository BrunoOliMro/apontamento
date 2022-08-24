<script>
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
    let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);
    let MATRIC = document.cookie.split(";")[0];

    const headers = new Headers();
    // headers.append("Content-Type", "application/json");

    let urlString = `/api/v1/apontamento?NUMERO_ODF=${NUMERO_ODF}&CODIGO_MAQUINA=${CODIGO_MAQUINA}&NUMERO_OPERACAO=${NUMERO_OPERACAO}`;
    let resultado = getOdfData();
    async function getOdfData() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        console.log(odfData);
        return odfData;
    }
</script>

<main>
    {#await resultado}
        <div>...</div>
    {:then dadosOdf}
        <div class="areaCodigos">
            <div class="odf">ODF: {NUMERO_ODF}</div>
            <div class="odf">
                Cód. Interno: {(dadosOdf[0].CODIGO_PECA[0] =
                    dadosOdf[0].CODIGO_PECA[0] === null
                        ? "SEM DADOS"
                        : dadosOdf[0].CODIGO_PECA[0])}
            </div>
            <div class="odf">Cód. do Cliente: {dadosOdf[0].CODIGO_CLIENTE}</div>
            <div class="odf">Operador: {MATRIC}</div>
            <div class="bold">
                OP: {NUMERO_OPERACAO} - {CODIGO_MAQUINA} - {dadosOdf[0]
                    .QTDE_ODF[0]}
            </div>
        </div>
    {/await}
</main>

<style>
    .bold {
        font-weight: bold;
    }
    .areaCodigos {
        padding: 0%;
        margin-top: 5%;
        height: 18rem;
        display: flex;
        flex-direction: column;
        align-items: left;
        justify-content: space-between;
    }
</style>
