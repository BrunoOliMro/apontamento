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
console.log('his', HISTORICO);

    if(HISTORICO.message === 'Não há histórico a exibir'){
      message = 'Não há histórico a exibir'
    }

    if (HISTORICO.message === "sem historico a exibir") {
      message = "sem historico a exibir";
    }

    if (HISTORICO.message === "historico encontrado") {
      message = "historico encontrado";
    }
  }
  let resultado = getHISTORICO();
  let back = "/images/icons8-go-back-24.png";
</script>

<main>
  <!-- <Breadcrumb /> -->
  <nav class="breadcrumb" aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <a href="/#/codigobarras/apontamento"> <img src={back} alt=""> Apontamento </a>
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
    {#if message === 'Não há histórico a exibir'}
    <div class="ifs">
      <h2>Não há histórico para exibir</h2>
    </div>
    {/if}
  {/await}
</main>

<style>
  a{
    color: #252525;
    font-size: 20px;
  }
  .breadcrumb{
    margin-top: 10px;
    margin-left: 10px;
    margin-bottom: 0%;
    margin-right: 0%;
  }

  a:hover{
    transition:all 1s;
    opacity: 0.5;
  }


  .ifs{
    margin-left: 1%;
  }
  .subtitle{
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
