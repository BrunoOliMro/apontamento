<script>
  let imageLoader = "/images/axonLoader.gif";
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

    dataInicio = dadosOdf.odfSelecionada.DT_INICIO_OP.slice(6, 8);
    meioInicio = dadosOdf.odfSelecionada.DT_INICIO_OP.slice(4, 6);
    anoInicio = dadosOdf.odfSelecionada.DT_INICIO_OP.slice(0, 4);
    horaInicio = dadosOdf.odfSelecionada.HORA_INICIO.slice(11, 19);

    dataFim = dadosOdf.odfSelecionada.DT_FIM_OP.slice(6, 8);
    meioFim = dadosOdf.odfSelecionada.DT_FIM_OP.slice(4, 6);
    anoFim = dadosOdf.odfSelecionada.DT_FIM_OP.slice(0, 4);
    horaFinal = dadosOdf.odfSelecionada.HORA_FIM.slice(11, 19);
  }
  let resultado = getOdfData();
</script>

{#await resultado}
  <div class="imageLoader">
    <div class="loader">
      <img src={imageLoader} alt="" />
    </div>
  </div>
{:then itens}
  <main class="main">
    <div class="text-area">
      <div class="title">INICIO</div>
      <div class="data-time">
        {dataInicio} / {meioInicio} / {anoInicio} - {(horaInicio =
          horaInicio === null ? "S/I" : horaInicio)}
      </div>
    </div>

    <div class="text-area">
      <div class="title">FINAL</div>
      <div class="data-time">
        {dataFim} / {meioFim} / {anoFim} - {(horaFinal =
          horaFinal === null ? "S/I" : horaFinal)}
      </div>
    </div>
  </main>
{/await}

<style>
  .data-time {
    display: flex;
    margin-left: 0px;
    padding: 0%;
  }
  .text-area {
    display: flex;
    flex-direction: column;
    margin: 0%;
    padding: 0%;
    justify-content: center;
    align-items: center;
    text-align: center;
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
    z-index: 99999999999;
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
    z-index: 999999999999;
  }
  main {
    font-size: 24px;
    font-weight: bold;
    width: 100%;
    padding: 0%;
    flex-direction: row;
    display: flex;
    justify-content: space-around;
    letter-spacing: 1px;
    margin: 0%;
    /* border-color: grey;
    box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
    border-radius: 5px; */
  }
  /* div {
    margin: 0%;
    justify-content: center;
    align-items: center;
    text-align: center;
  } */

  /* .div2 {
    margin-left: 41%;
  } */
  .title {
    font-size: 21;
    font-weight: normal;
    margin: 0%;
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
