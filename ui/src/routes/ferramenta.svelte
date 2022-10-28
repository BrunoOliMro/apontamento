<script>
  // @ts-nocheck

  let urlString = `/api/v1/ferramenta`;
  let fetchItem = [];
  let resultado = getfetchItem();
  let urlFer = `/api/v1/ferselecionadas`;
  let fer = [];
  let adicionados = 0;
  let arrayComp = [];
  let toolMsg = "";

  if (window.location.href.includes("?")) {
    toolMsg = window.location.href.split("?")[1].split("=")[1];
  }

  async function ferSelected() {
    const res = await fetch(urlFer);
    fer = await res.json();
    if (fer.message === "ferramentas selecionadas com successo") {
      window.location.href = "/#/codigobarras/apontamento";
      location.reload();
    }
  }

  async function getfetchItem() {
    const res = await fetch(urlString);
    fetchItem = await res.json();
    if (fetchItem == "/images/sem_imagem.gif") {
      window.location.href = "/#/codigobarras/apontamento";
    }
    if (fetchItem.length === 0) {
      ferSelected();
      window.location.href = "/#/codigobarras/apontamento";
    }
  }

  function checkIfclicked(column, imgId) {
    if (!arrayComp.includes(column)) {
      adicionados += 1;
      arrayComp.push(column);
      document.getElementById(imgId).style.border = "2px solid green";
      document.getElementById(imgId).style.transition = "1px";
    }
    if (fetchItem.length === arrayComp.length) {
      ferSelected();
    }
  }
</script>

<div class="content">
  {#await fetchItem}
    <div>AGUARDE...</div>
  {:then item}
    <h3>Selecione as Ferramentas para a produção</h3>
    <div class="itens">
      <!-- {#if fetchItem.length === 0}
        <h3>Não há Ferramentas para exibir</h3>
      {/if} -->
      {#each item as column, i}
        <img
          tabindex="${i}"
          on:keypress={checkIfclicked(column, `img-${i}`)}
          on:click={checkIfclicked(column, `img-${i}`)}
          id="img-{i}"
          class="img"
          src={column}
          alt=""
        />
      {/each}
    </div>
  {/await}
</div>

<style>
  @keyframes rotation {
    from {
      opacity: 1;
      transform: rotate(0deg);
    }
    to {
      opacity: 1;
      transform: rotate(359deg);
    }
  }

  .itens {
    display: flex;
    flex-direction: row;
  }
  .img {
    display: flex;
    flex-direction: row;
    width: 200px;
    height: 200px;
    margin: 1%;
    border-radius: 3px;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .img:hover {
    outline: none;
    cursor: pointer;
    transition: 1s;
  }

  .content {
    margin-left: 5%;
    margin-right: 5%;
    justify-content: center;
    align-items: center;
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  div {
    margin: 1%;
    border-radius: 5px;
    letter-spacing: 1px;
  }

  @media (max-width: 820px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }

  @media (max-width: 1200px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }

  @media screen and (max-width: 550px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }

  @media screen and (min-width: 551px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }

  @media screen and (min-width: 860px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }
  @media screen and (min-width: 1000px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }
  @media screen and (min-width: 1200px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }
  @media screen and (min-width: 1400px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
    /* .subtitle {
      font-size: 20px;
    } */
  }

  @media screen and (min-width: 1600px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
    /* .subtitle {
      font-size: 20px;
    } */
  }
</style>
