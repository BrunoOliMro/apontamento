<script>
  // @ts-nocheck
  import TableHistorico from "../components/Tables/TableHistorico.svelte";
  let message = "";
  let back = "/images/icons8-go-back-24.png";
  let imageLoader = "/images/axonLoader.gif";
  let subtitle = "Histórico de Apontamento";
  let urlString = `/api/v1/historic`;
  let messageOnBtn = "Detalhado";
  let historicData = [];
  let showNormalTable = false;
  let showDetail = true;
  let resultado = getHistorico();

  async function getHistorico() {
    const res = await fetch(urlString);
    historicData = await res.json();
    if (historicData.message !== "") {
      message = historicData.message;
    }
  }

  function detail() {
    if (showNormalTable === true) {
      messageOnBtn = "Detalhado";
      showNormalTable = false;
      showDetail = true;
    } else {
      messageOnBtn = "Geral";
      showDetail = false;
      showNormalTable = true;
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
  {#await resultado}
    <div class="imageLoader">
      <div class="loader">
        <img src={imageLoader} alt="" />
      </div>
    </div>
  {:then itens}
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
              <th scope="col">ODF</th>
              {#if showNormalTable === true}
                <th scope="col">DATA</th>
                <th scope="col">HORA</th>
              {/if}
            </tr>
          </thead>

          {#if showDetail === true}
            <tbody id="table-body">
              {#each historicData.resourceDetail as column}
                <TableHistorico dados={column} />
              {/each}
            </tbody>
          {/if}

          {#if showNormalTable === true}
            <tbody id="table-body">
              {#each historicData.resource as column}
                <TableHistorico dados={column} />
              {/each}
            </tbody>
          {/if}
        </table>
      </div>
    {/if}

    {#if message !== "" && message !== "Exibir histórico"}
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
    /* width: 98%; */
    margin: 0%;
    padding: 0%;
    font-size: 25px;
  }
  /* button{
    width: 100px;
    height: 30px;
    border: gray;
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    text-align: center;
    letter-spacing: 1px;
  } */
  /* .sideBtn {
    width: 100px;
    margin: 1%;
    padding: 0%;
    border: grey;
    flex-direction: row; 
    justify-content: right;
    align-items: center;
    text-align: center;
    border-radius: 5px;
  } */

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
    /* background-color: rebeccapurple; */
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

  /* #table-body {
    height: 250px;
    background-color: rebeccapurple;
  } */

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
    main {
    }

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
    main {
    }

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
