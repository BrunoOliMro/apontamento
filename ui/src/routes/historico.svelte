<script>
  // @ts-nocheck
  let imageLoader = "/images/axonLoader.gif";
  import TableHistorico from "../components/Tables/TableHistorico.svelte";
  let subtitle = "Histórico de Apontamento";
  let historicData = [];
  let urlString = `/api/v1/historic`;
  let message = "";
  let resultado = getHistorico();
  let back = "/images/icons8-go-back-24.png";
  let showDetail = false;
  let showNormalTable = true;
  let l = {};
  let y;
  let w = {};

  async function getHistorico() {
    const res = await fetch(urlString);
    historicData = await res.json();
    // console.log("linha 18", historicData);

    let z = historicData.resource.reduce((acc, iterator, i) => {
      // console.log("acc", acc);
      // console.log("ite", iterator);
      //console.log("linha 24", historicData.resource[0].BOAS);
    });
    //   if (iterator.MAQUINA === "SER01") {
    //     w = iterator;
    //     //w.keys = acc + iterator.BOAS + iterator.REFUGO
    //   }
    //   return acc;
    // }, 0);

    

    // console.log("w", w);
    //console.log("z", z);
    console.log("linha 36", Object.entries(historicData.resource));

    Object.entries(historicData.resource).reduce((acc, ite, i)=>{
      
      console.log("linha acc", acc);
      console.log("linha ite", ite);
      //console.log("linha i", i);
    })

    const total = Object.entries(historicData.resource).reduce(function (acc,iterator,i) {
      const [key, value] = iterator;



      console.log("linha 40", key);
      console.log("linha 41", acc[i]);

      if (iterator.MAQUINA === "SER01") {
        y = iterator[i].BOAS + value.BOAS;
      }
    },
    0);




    //console.log("total ", total);
    //console.log("y", y);

    for (const iterator of historicData.resource) {
      if (iterator.MAQUINA === "SER01") {
        iterator.BOAS;
      }
      // console.log("linha 32", iterator);
      // if (iterator.MAQUINA === "SER01") {
      //   y.push(iterator);
      // }

      // if(iterator.MAQUINA === 'SER01'){
      //   w = iterator.BOAS + iterator.REFUGO
      //   y.push(w)
      // }
    }
    //console.log("linha 34", w);
    //console.log("linha 35", y);

    if (historicData.message === "Não há histórico a exibir") {
      message = "Não há histórico a exibir";
    }

    if (historicData.message === "Exibir histórico") {
      message = "Exibir histórico";
    }

    if (historicData.message === "Error ao localizar o histórico") {
      message = "Error ao localizar o histórico";
    }

    // if (historicData === undefined || historicData === null) {
    //   return (message = "Error ao localizar o histórico");
    // } else if (historicData !== "Não há histórico a exibir") {
    //   console.log("erubvuerb");
    //   resultSum = historicData.resource.reduce((acc, iterator) => {
    //     return acc + iterator.BOAS + iterator.REFUGO;
    //   }, 0);
    //   if (resultSum <= 0) {
    //     return (message = "Não há histórico a exibir");
    //   }
    // }
  }

  function detail() {
    if (showNormalTable === true) {
      showNormalTable = false;
      showDetail = true;
    } else {
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
    <button on:click={detail} on:keypress={detail} class="sideBtn"
      >Detalhado</button
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
              <th scope="col">DATA</th>
              <th scope="col">HORA</th>
            </tr>
          </thead>
          {#if showDetail === true}
            <tbody id="corpoTabela">
              {#each historicData.resource as column}
                <TableHistorico dados={column} />
              {/each}
            </tbody>
          {/if}

          {#if showNormalTable === true}
            <h3>uorewbuvrb Normmal e ecoiasera</h3>
          {/if}
        </table>
      </div>
    {/if}

    {#if message === "Não há histórico a exibir"}
      <div class="message">
        <h3>Não há histórico a exibir</h3>
      </div>
    {/if}

    {#if message === "Error ao localizar o histórico"}
      <div class="message">
        <h3>Erro ao solicitar o histórico</h3>
      </div>
    {/if}
  {/await}
</main>

<style>
  table {
    width: 98%;
    margin: 0%;
    padding: 0%;
  }
  .sideBtn {
    margin: 1%;
    padding: 0%;
    border: none;
    background-color: transparent;
    color: black;
    flex-direction: row;
    justify-content: right;
    align-items: right;
    text-align: right;
  }

  button:hover {
    opacity: 0.5;
    transition: all 1s;
    background-color: black;
    border-radius: 4px;
    color: white;
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

  /* #corpoTabela {
    height: 250px;
    background-color: rebeccapurple;
  } */

  a:hover {
    transition: all 1s;
    opacity: 0.5;
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
