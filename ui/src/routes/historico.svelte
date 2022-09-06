<script>
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  let subtitle = "Historico de Apontamento"
  let HISTORICO = [];
  let urlString = `/api/v1/HISTORICO?&HISTORICO=${HISTORICO}`;

  async function getHISTORICO() {
    const res = await fetch(urlString);
    HISTORICO = await res.json();
    return HISTORICO;
  }
  let res = getHISTORICO();
</script>

<main>
  <Breadcrumb />
  <div class="subtitle">{subtitle}</div>
  <div class="main">
    {#await res}
      <div>...</div>
    {:then HISTORICO}
      <div id="cardb" class="card">
        {JSON.stringify(HISTORICO)}
      </div>
    {/await}
  </div>
</main>

<style>
  main {
    margin: 1%;
  }
  #cardb {
    width: 600px;
    height: 200px;
  }

  @media screen and (max-width: 550px) {
    main {
      margin: 1%;
    }
    #cardb {
      width: 425px;
      height: 200px;
      margin: 1%;
    }
    .subtitle{
      font-size: 23px;
      margin: 1%;
    }
    .main{
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
    #cardb {
      width: 450px;
      height: 200px;
      margin: 1%;
    }
    .subtitle{
      font-size: 25px;
      margin: 1%;
    }
    .main{
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
    #cardb {
      width: 475px;
      height: 200px;
      margin: 1%;
    }
    .subtitle{
      font-size: 28px;
      margin: 1%;
    }
    .main{
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
    #cardb {
      width: 600px;
      height: 200px;
    }
    .subtitle{
      font-size: 30px;
      margin: 1%;
    }
    .main{
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
    #cardb {
      width: 600px;
      height: 200px;
    }
    .main{
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .subtitle{
      font-size: 35px;
      margin: 1%;
    }
  }
  @media screen and (min-width: 1400px) {
    main {
      margin: 1%;
    }
    #cardb {
      width: 600px;
      height: 200px;
    }
    .main{
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .subtitle{
      font-size: 35px;
      margin: 1%;
    }
  }

  @media screen and (min-width: 1600px) {
    main {
      margin: 1%;
    }
    #cardb {
      width: 600px;
      height: 200px;
    }
    .main{
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .subtitle{
      font-size: 35px;
      margin: 1%;
    }
  }
</style>
