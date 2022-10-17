<script>
  let dadosOdf = [];
  let urlString = `/api/v1/odf`;
  let horaInicio = "";
  let horaFinal = "";

  let dataInicio = "";
  let anoInicio = "";
  let meioInicio = "";

  let dataFim = "";
  let meioFim = "";
  let anoFim = "";

  async function getOdfData() {
    const res = await fetch(urlString);
    dadosOdf = await res.json();

    dataInicio = dadosOdf.objOdfSelecionada.DT_INICIO_OP.slice(6, 8)
    meioInicio = dadosOdf.objOdfSelecionada.DT_INICIO_OP.slice(4, 6)
    anoInicio = dadosOdf.objOdfSelecionada.DT_INICIO_OP.slice(0, 4)
    horaInicio = dadosOdf.objOdfSelecionada.HORA_INICIO.slice(11, 19)


    dataFim = dadosOdf.objOdfSelecionada.DT_FIM_OP.slice(6, 8)
    meioFim = dadosOdf.objOdfSelecionada.DT_FIM_OP.slice(4, 6)
    anoFim = dadosOdf.objOdfSelecionada.DT_FIM_OP.slice(0, 4)
    horaFinal = dadosOdf.objOdfSelecionada.HORA_FIM.slice(11, 19);
  }

  let resultado = getOdfData();
</script>

{#await resultado}
  <div>...</div>
{:then itens}
  <main class="main">
    <div class="div1">
      <div class="title">INICIO</div>
      {dataInicio} / {meioInicio} / {anoInicio} - {(horaInicio = horaInicio === null ? "S/I" : horaInicio)}
    </div>

    <div class="div2">
      <div class="title">FINAL</div>
      {dataFim} / {meioFim} /  {anoFim} - {(horaFinal = horaFinal === null ? "S/I" : horaFinal)}
    </div>
  </main>
{/await}

<style>
  main {
    font-weight: bold;
    margin: 1% 0%;
    justify-content: space-around;
    flex-direction: row;
    display: flex;
    letter-spacing: 1px;
    border-color: grey;
    box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
    border-radius: 5px;
  }
  div {
    margin: 1%;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .title {
    font-weight: normal;
  }

  /* @media screen and (max-width: 574px) {
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
      justify-content: space-around;
      text-align: left;
      align-items: left;
    }
    .title {
      font-weight: normal;
    }
  } */
</style>
