<script>
  import messageQuery from "../../utils/checkMessage";

  let imageLoader = "/images/axonLoader.gif";
  let horaInicio = "";
  let horaFinal = "";

  let dataInicio = "";
  let anoInicio = "";
  let meioInicio = "";

  let dataFim = "";
  let meioFim = "";
  let anoFim = "";

  export let odfData;
  console.log('Footer.svelte:', odfData);

  if (!odfData.codData.data) {
    odfData.codData.data = "S/I";
  }

  if (odfData.codData.status === messageQuery(1)) {
    if (odfData.codData.message === messageQuery(4)) {
      odfData = "S/I";
    } else if (odfData.codData.data) {
      let odf = odfData.codData.data.odfSelecionada;

      modifyObj(Object.keys(odfData.codData.data.odfSelecionada), odf);

      dataInicio = odf.DT_INICIO_OP.slice(6, 8);

      meioInicio = odf.DT_INICIO_OP.slice(4, 6);

      anoInicio = odf.DT_INICIO_OP.slice(0, 4);

      horaInicio = odf.HORA_INICIO.slice(11, 19);

      dataFim = odf.DT_FIM_OP.slice(6, 8);

      meioFim = odf.DT_FIM_OP.slice(4, 6);

      anoFim = odf.DT_FIM_OP.slice(0, 4);

      horaFinal = odf.HORA_FIM.slice(11, 19);

      horaFinal = odf.HORA_FIM.slice(11, 19);
    }
  }

  //Takes an array and modify undefined and null values
  /**
   * @param {any[]} array
   * @param {{ [x: string]: string; }} x
   */
  function modifyObj(array, x) {
    array.forEach((key) => {
      x[key] = x[key] ?? "";
    });
  }
  // }
</script>

{#await odfData.codData.data}
  <div class="image-loader">
    <div class="loader">
      <img src={imageLoader} alt="" />
    </div>
  </div>
{:then}
  <main class="main">
    <div class="text-area">
      <div class="title">Início</div>
      <div class="data-time">
        {dataInicio} / {meioInicio} / {anoInicio} - {(horaInicio =
          horaInicio === "" ? "S/I" : horaInicio)}
      </div>
    </div>

    <div class="text-area">
      <div class="title">Fim</div>
      <div class="data-time">
        {dataFim} / {meioFim} / {anoFim} - {(horaFinal =
          horaFinal === "" ? "S/I" : horaFinal)}
      </div>
    </div>
  </main>
{/await}

<!-- {#if message !== ""}
  <h1>{message}</h1>
{/if} -->

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
  .image-loader {
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
  }
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
