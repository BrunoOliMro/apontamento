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

<main class="main">
  {#await resultado}
    <div>...</div>
  {:then dadosOdf}
    <div class="div1">
      <div class="title">
        INICIO:
      </div>
      {dadosOdf[0].DT_INICIO_OP.slice(6, 8)} /
      {dadosOdf[0].DT_INICIO_OP.slice(4, 6)} /
      {dadosOdf[0].DT_INICIO_OP.slice(0, 4)}
      - {(dadosOdf[0].HORA_INICIO =
        dadosOdf[0].HORA_INICIO === null
          ? "SEM DADOS"
          : dadosOdf[0].HORA_INICIO)}
    </div>

    <div class="div2">
      <div class="title">
        FINAL:
      </div>
      {dadosOdf[0].DT_FIM_OP.slice(6, 8)} /
      {dadosOdf[0].DT_FIM_OP.slice(4, 6)} /
      {dadosOdf[0].DT_FIM_OP.slice(0, 4)} -
      {(dadosOdf[0].HORA_FIM =
        dadosOdf[0].HORA_FIM === null ? "SEM DADOS" : dadosOdf[0].HORA_FIM)}
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

  @media screen and (max-width: 574px) {
    .main {
      margin-top: 6%;
      font-size: 15px;
      margin-left: 1%;
      margin-right: 1%;
      justify-content: space-around;
      text-align: left;
      align-items: left;
    }
    div{
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .title{
      font-weight: normal;
    }
  }
  @media screen and (min-width: 575px) {
    .main {
      margin-left: 1%;
      margin-right: 1%;
      justify-content: space-around;
      text-align: left;
      align-items: left;
    }
    div{
      font-size: 22px;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .title{
      font-weight: normal;
    }
  }
  @media screen and (min-width: 860px) {
    .main {
      font-size: 20px;
      margin-left: 1%;
      margin-right: 1%;
      justify-content: space-around;
      text-align: left;
      align-items: left;
    }
    .title{
      font-weight: normal;
    }
  }

  @media screen and (min-width: 1000px) {
    .main {
      font-size: 20px;
      margin-left: 1%;
      margin-right: 1%;
      justify-content: space-around;
      text-align: left;
      align-items: left;
    }
    .title{
      font-weight: normal;
    }
  }
  @media screen and (min-width: 1200px) {
    .main {
      font-size: 20px;
      margin-left: 1%;
      margin-right: 1%;
      justify-content: space-around;
      text-align: left;
      align-items: left;
    }
    .title{
      font-weight: normal;
    }
  }

  @media screen and (min-width: 1600px) {
    .main {
      font-size: 25px;
      margin-left: 1%;
      margin-right: 1%;
      justify-content: space-around;
      text-align: left;
      align-items: left;
    }
    .title{
      font-weight: normal;
    }
  }
</style>
