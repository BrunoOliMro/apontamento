<script>
  var dataFromBarcode = localStorage.getItem("barcodeData");
  let NUMERO_ODF = Number(dataFromBarcode.slice(10));
  let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
  let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);
  const headers = new Headers();
  // headers.append("Content-Type", "application/json");

  let urlString = `/api/v1/apontamento?NUMERO_ODF=${NUMERO_ODF}&CODIGO_MAQUINA=${CODIGO_MAQUINA}&NUMERO_OPERACAO=${NUMERO_OPERACAO}`;
  let resultado = getOdfData();
  async function getOdfData() {
    const res = await fetch(urlString);
    const odfData = await res.json();
    return odfData;
  }
</script>

<main>
  {#await resultado}
    <div>...</div>
  {:then dadosOdf}
    <div>
      INICIO: {dadosOdf[0].DT_INICIO_OP.slice(6, 8)} /
      {dadosOdf[0].DT_INICIO_OP.slice(4, 6)} /
      {dadosOdf[0].DT_INICIO_OP.slice(0, 4)}
      - {(dadosOdf[0].HORA_INICIO = dadosOdf[0].HORA_INICIO === null ? "SEM DADOS" : dadosOdf[0].HORA_INICIO)}
    </div>

    <div>
      FINAL: {dadosOdf[0].DT_FIM_OP.slice(6, 8)} /
      {dadosOdf[0].DT_FIM_OP.slice(4, 6)} /
      {dadosOdf[0].DT_FIM_OP.slice(0, 4)} - 
      {(dadosOdf[0].HORA_FIM = dadosOdf[0].HORA_FIM === null ? "SEM DADOS" : dadosOdf[0].HORA_FIM)}
    </div>
  {/await}
</main>

<style>
  main {
    display: flex;
    font-weight: bold;
    margin-top: 5%;
    justify-content: space-around;
  }

  @media (max-width: 400px) {
        main {
            font-size: 10px;
        }
    }
</style>
