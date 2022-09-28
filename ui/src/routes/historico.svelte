<script>
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  let subtitle = "Historico de Apontamento";
  let HISTORICO = [];
  let urlString = `/api/v1/HISTORICO?&HISTORICO=${HISTORICO}`;

  async function getHISTORICO() {
    const res = await fetch(urlString);
    HISTORICO = await res.json();
  }
  let res = getHISTORICO();
</script>

<main>
  <Breadcrumb />
  <div class="subtitle">{subtitle}</div>
  <div class="main">
      {#if HISTORICO.length !== 0 }
      <table class="table table-hover table-striped caption-top">
        <thead>
          <tr id="header">
            <th scope="col">OP</th>
            <th scope="col">ODF</th>
            <th scope="col">MAQUINA</th>
            <th scope="col">BOAS</th>
            <th scope="col">REFUGO</th>
            <th scope="col">FALTANTE</th>
          </tr>
        </thead>
        <tbody id="corpoTabela">
          {#each HISTORICO as row, i}
          <td>{HISTORICO[0].OP === null || !HISTORICO[0].OP ? "S/I" : HISTORICO[0].OP}</td>
          <td>{HISTORICO[0].ODF === null || !HISTORICO[0].ODF ? "S/I" : HISTORICO[0].ODF}</td>
          <td>{HISTORICO[0].MAQUINA === null || !HISTORICO[0].MAQUINA ? "S/I" : HISTORICO[0].MAQUINA}</td>
          <td>{HISTORICO[0].BOAS === null || !HISTORICO[0].BOAS ? "S/I" : HISTORICO[0].BOAS}</td>
          <td>{HISTORICO[0].REFUGO === null || !HISTORICO[0].REFUGO ? "S/I" : HISTORICO[0].REFUGO}</td>
          <td>{HISTORICO[0].PC_FALTANTE === null || !HISTORICO[0].PC_FALTANTE ? "S/I" : HISTORICO[0].PC_FALTANTE}</td>
          {/each}
        </tbody>
      </table>
      {:else}
        <h3>Não há histórico para exibir</h3>
      {/if}
  </div>
</main>

<style>
  main {
    margin: 1%;
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
