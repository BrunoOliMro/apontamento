<script>
  // @ts-nocheck
  import TableHistorico from "../components/Tables/TableHistorico.svelte";
  import messageQuery from "../utils/checkMessage";
  let back = "/images/icons8-go-back-24.png";
  let imageLoader = "/images/axonLoader.gif";
  let subtitle = "Histórico de Apontamento";
  let urlString = `/api/v1/historic`;
  let messageOnBtn = "Detalhado";
  let result = getHistorico();
  let historic = [];
  let generalData = false;
  let detailData = true;
  let message = "";

  async function getHistorico() {
    const res = await fetch(urlString);
    historic = await res.json();
    if(historic.data.resourceDetail === messageQuery(0)){
      return message = "Não há exibir histórico"
    }
    if (historic.message === messageQuery(40)) {
      message = historic.message;
    }
  }

  function detail() {
    if (generalData === true) {
      messageOnBtn = "Detalhado";
      generalData = false;
      detailData = true;
    } else {
      messageOnBtn = "Geral";
      detailData = false;
      generalData = true;
    }
  }
</script>

<main>
  <nav class="breadcrumb" aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <a href="/#/codigobarras/apontamento">
          <img src={back} alt="" /> Apontamento
        </a>
      </li>
    </ol>
  </nav>
  <div class="subtitle">{subtitle}</div>
  <div class="sideBtn">
    <button on:click={detail} on:keypress={detail} class="btnMessage"
      >{messageOnBtn}</button
    >
  </div>
  {#await result}
    <div class="imageLoader">
      <div class="loader">
        <img src={imageLoader} alt="" />
      </div>
    </div>
  {:then}
    {#if message === "Exibir histórico"}
      <div class="tabela table-responsive">
        <table class="table table-hover table-striped caption-top">
          <thead>
            <tr id="header">
              <th scope="col">OP</th>
              <th scope="col">MAQUINA</th>
              <th scope="col">BOAS</th>
              <th scope="col">REFUGO</th>
              <th scope="col">FALTANTE</th>
              <th scope="col">RETRABALHADA</th>
              <th scope="col">ODF</th>
              {#if generalData === true}
                <th scope="col">DATA</th>
                <th scope="col">HORA</th>
              {/if}
            </tr>
          </thead>

          {#if detailData === true}
            <tbody id="table-body">
              {#each historic.data.resource as column}
                <TableHistorico dados={column} />
              {/each}
            </tbody>
          {/if}

          {#if generalData === true}
            <tbody id="table-body">
              {#each historic.data.resourceDetail as column}
                <TableHistorico dados={column} />
              {/each}
            </tbody>
          {/if}
        </table>
      </div>
    {/if}

    {#if message !== messageQuery(0) && message === "Não há exibir histórico" && historic.data.resourceDetail === messageQuery(0)}
      <div class="message">
        <h3>{message}</h3>
      </div>
    {/if}
  {/await}
</main>

<style>
  .btnMessage {
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100px;
    height: 30px;
    border: none;
    background-color: white;
    border-color: #999999;
    box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
    letter-spacing: 1px;
    border-radius: 6px;
    color: black;
  }
  table {
    margin: 0%;
    padding: 0%;
    font-size: 25px;
  }
  .sideBtn {
    margin: 1%;
    padding: 0%;
    display: grid;
    flex-direction: row;
    justify-content: right;
    text-align: right;
    align-items: right;
  }

  .btnMessage:hover {
    opacity: 0.8;
    transition: all 1s;
    background-color: white;
    color: black;
  }
  .message {
    height: 200px;
    width: 100vw;
    display: flex;
    flex-direction: row;
    position: relative;
    left: 0;
    top: 0;
    align-items: center;
    justify-content: center;
  }
  a {
    color: #252525;
    font-size: 20px;
  }
  .breadcrumb {
    margin-top: 10px;
    margin-left: 10px;
    margin-bottom: 0%;
    margin-right: 0%;
  }

  a:hover {
    transition: all 1s;
    opacity: 0.8;
  }

  .subtitle {
    margin-bottom: 1%;
    margin-top: 1%;
    margin-left: 1%;
    padding: 0%;
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
    z-index: 99999999999999999;
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
    z-index: 99999999999999;
  }
  th {
    text-align: center;
  }

  /* @media screen and (max-width: 550px) {
    main {
      
    }

    .subtitle {
      font-size: 23px;
    }
  } */

  @media screen and (min-width: 551px) {
    /* main {
      
    }

    .subtitle {
      font-size: 25px;
      
    } */
    /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
  }

  @media screen and (min-width: 860px) {
    .subtitle {
      font-size: 28px;
    }
    /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
  }
  @media screen and (min-width: 1000px) {
    .subtitle {
      font-size: 30px;
    }
    /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
  }
  /* @media screen and (min-width: 1200px) {
    main {
      
    } */

  /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
  /* .subtitle {
      font-size: 35px;
      
    }
  } */
  /* @media screen and (min-width: 1400px) {
    main {
      
    } */

  /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
  /* .subtitle {
      font-size: 35px;
      
    }
  } */

  /* @media screen and (min-width: 1600px) { */
  /* main {
      
    } */

  /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
  /* .subtitle {
      font-size: 35px;
      
    }
  } */
</style>
