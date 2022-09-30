<script>
  import { each } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  let fetchItem = [];
  let urlString = `/api/v1/ferramenta?fetchItem${fetchItem}`;

  async function getfetchItem() {
    const res = await fetch(urlString);
    fetchItem = await res.json();
    return fetchItem;
  }
  let resultado = getfetchItem();

  let toolMsg = "";
  if (window.location.href.includes("?")) {
    toolMsg = window.location.href.split("?")[1].split("=")[1];
  }

  let everCheck = false;
  let arrayComp = [];

  let adicionados = 0;
  function checkIfclicked(column, imgId) {
  if(!arrayComp.includes(column)) {
    arrayComp.push(column);
    document.getElementById(imgId).style.border = "1px solid green";
    document.getElementById(imgId).style.transition = "1px";
    adicionados += 1;
  }
    if (fetchItem.length === arrayComp.length) {
      everCheck = true;
      window.location.href = "/#/codigobarras/apontamento";
    }
    if(fetchItem.length === 0){
      window.location.href = "/#/codigobarras/apontamento";
    }
  }

  function redirect() {
    window.location.href = "/#/codigobarras/apontamento";
  }
</script>

<div>
  <div class="content">
    {#if fetchItem.length === 0}
      <h3>Não há Ferramentas para exibir</h3>
    {/if}

    {#if fetchItem.length > 0}
      {#if everCheck === false}
        <h3>Selecione as Ferramentas para a produção</h3>
      {/if}
    {/if}

    <!-- {#if everCheck === true}
    <div class="loader">
      <div class="spinner"></div>
    </div>
      <button class="sideButton" on:click={redirect}>Apontar</button>
    {/if} -->

    <div class="itens">
      {#each fetchItem as column, i}
        {#if fetchItem.length > 0}
          {#if everCheck === false}
            <img
              on:click={checkIfclicked(column, `img-${i}`)}
              id="img-{i}"
              class="img"
              src={column}
              alt=""
            />
          {/if}
        {/if}
      {/each}
    </div>
  </div>
</div>

<style>

.loader {
  display: flex;
  height: 50vh;
  justify-content: center;
  align-items: center;
}

.spinner {
  height: 5vh;
  width: 5vh;
  border: 6px solid rgba(0, 0, 0, 0.2);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-radius: 100%;
  animation: rotation 0.6s infinite linear 0.25s;

  /* the opacity is used to lazyload the spinner, see animation delay */
  /* this avoid the spinner to be displayed when visible for a very short period of time */
  opacity: 0;
}

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
  .sideButton {
    margin: 1%;
    padding: 0%;
    font-size: 22px;
    width: 250px;
    height: 70px;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    border-radius: 3px;
    background-color: transparent;
  }

  .sideButton:hover {
    outline: none;
    cursor: pointer;
    background-color: black;
    color: white;
    transition: 1s;
  }
  .incializeProd {
    font-size: 55px;
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

  .btnA {
    color: black;
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
    .subtitle {
      font-size: 20px;
    }
  }

  @media screen and (min-width: 1600px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
    .subtitle {
      font-size: 20px;
    }
  }
</style>
