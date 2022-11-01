<script>
  // @ts-nocheck
  let imageLoader = "/images/axonLoader.gif";
  import TableHistorico from "../components/Tables/TableHistorico.svelte";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  let subtitle = "Historico de Apontamento";
  let HISTORICO = [];
  let urlString = `/api/v1/historic`;
  let message = "";

  async function getHISTORICO() {
    const res = await fetch(urlString);
    HISTORICO = await res.json();
    if (HISTORICO.message === "sem historico a exibir") {
      message = "sem historico a exibir";
    }

    if (HISTORICO.message === "historico encontrado") {
      message = "historico encontrado";
    }
  }
  let resultado = getHISTORICO();
</script>

<main>
  <!-- <Breadcrumb /> -->
  <nav class="breadcrumb" aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <a href="/#/codigobarras/apontamento">Apontamento</a>
      </li>
    </ol>
  </nav>
  <div class="subtitle">{subtitle}</div>
  {#await resultado}
    <div class="imageLoader">
      <div class="loader">
        <img src={imageLoader} alt="" />
      </div>
    </div>
  {:then itens}
    {#if message === "historico encontrado"}
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
            </tr>
          </thead>
          <tbody id="corpoTabela">
            {#each HISTORICO.resource as column, i}
              <TableHistorico dados={column} />
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
    {#if message === "sem historico a exibir"}
      <h2>Não há histórico para exibir</h2>
    {/if}
  {/await}
</main>

<style>
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

  @media screen and (max-width: 550px) {
    main {
      margin: 1%;
    }

    .subtitle {
      font-size: 23px;
      margin: 1%;
    }
  }

  @media screen and (min-width: 551px) {
    main {
      margin: 1%;
    }

    .subtitle {
      font-size: 25px;
      margin: 1%;
    }
    /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
  }

  @media screen and (min-width: 860px) {
    main {
      margin: 1%;
    }

    .subtitle {
      font-size: 28px;
      margin: 1%;
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
      margin: 1%;
    }

    .subtitle {
      font-size: 30px;
      margin: 1%;
    }
    /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
  }
  @media screen and (min-width: 1200px) {
    main {
      margin: 1%;
    }

    /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
    .subtitle {
      font-size: 35px;
      margin: 1%;
    }
  }
  @media screen and (min-width: 1400px) {
    main {
      margin: 1%;
    }

    /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
    .subtitle {
      font-size: 35px;
      margin: 1%;
    }
  }

  @media screen and (min-width: 1600px) {
    main {
      margin: 1%;
    }

    /* .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    } */
    .subtitle {
      font-size: 35px;
      margin: 1%;
    }
  }
</style>
