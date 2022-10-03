<script>
  // var dataFromBarcode = localStorage.getItem("barcodeData");
  // let NUMERO_ODF = Number(dataFromBarcode.slice(10));
  // let NUMERO_OPERACAO = String(dataFromBarcode.slice(0, 5));
  // let CODIGO_MAQUINA = String(dataFromBarcode.slice(5, 10));
  let dadosOdf = [];
  let urlString = `/api/v1/odf`;

  async function getOdfData() {
    const res = await fetch(urlString);
    dadosOdf = await res.json();
    console.log(dadosOdf);
  }
  let resultado = getOdfData();
</script>

{#await resultado}
  <div>...</div>
{:then itens}
  <main class="main">
    <div class="div1">
      <div class="title">INICIO:</div>
      {dadosOdf[0].DT_INICIO_OP.slice(6, 8)} /
      {dadosOdf[0].DT_INICIO_OP.slice(4, 6)} /
      {dadosOdf[0].DT_INICIO_OP.slice(0, 4)}
      - {(dadosOdf[0].HORA_INICIO =
        dadosOdf[0].HORA_INICIO === null
          ? "S/I"
          : dadosOdf[0].HORA_INICIO)}
    </div>

    <div class="div2">
      <div class="title">FINAL:</div>
      {dadosOdf[0].DT_FIM_OP.slice(6, 8)} /
      {dadosOdf[0].DT_FIM_OP.slice(4, 6)} /
      {dadosOdf[0].DT_FIM_OP.slice(0, 4)} -
      {(dadosOdf[0].HORA_FIM =
        dadosOdf[0].HORA_FIM === null ? "S/I" : dadosOdf[0].HORA_FIM)}
    </div>
  </main>
{/await}

<style>
  main {
    display: flex;
    font-weight: bold;
    margin-top: 3%;
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
    div {
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .title {
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
    div {
      font-size: 22px;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .title {
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
    .title {
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
    .title {
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
    .title {
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
    .title {
      font-weight: normal;
    }
  }
</style>
