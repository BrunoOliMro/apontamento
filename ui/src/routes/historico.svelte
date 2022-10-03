<script>
  import TableHistorico from "../components/Tables/TableHistorico.svelte";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  let subtitle = "Historico de Apontamento";
  let HISTORICO = [];
  let urlString = `/api/v1/HISTORICO`;

  async function getHISTORICO() {
    const res = await fetch(urlString);
    HISTORICO = await res.json();
    console.log(HISTORICO);
  }
  let resultado = getHISTORICO();
</script>

<main>
  <Breadcrumb />
  <div class="subtitle">{subtitle}</div>
  {#if HISTORICO.length !== 0}
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
          {#each HISTORICO as column, i}
            <TableHistorico dados={column} />
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <h2>Não há histórico para exibir</h2>
  {/if}
</main>

<style>

  main {
    margin: 1%;
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
    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
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
    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
  }

  @media screen and (min-width: 860px) {
    main {
      margin: 1%;
    }

    .subtitle {
      font-size: 28px;
      margin: 1%;
    }
    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
  }
  @media screen and (min-width: 1000px) {
    main {
      margin: 1%;
    }

    .subtitle {
      font-size: 30px;
      margin: 1%;
    }
    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
  }
  @media screen and (min-width: 1200px) {
    main {
      margin: 1%;
    }

    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .subtitle {
      font-size: 35px;
      margin: 1%;
    }
  }
  @media screen and (min-width: 1400px) {
    main {
      margin: 1%;
    }

    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .subtitle {
      font-size: 35px;
      margin: 1%;
    }
  }

  @media screen and (min-width: 1600px) {
    main {
      margin: 1%;
    }

    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .subtitle {
      font-size: 35px;
      margin: 1%;
    }
  }
</style>
