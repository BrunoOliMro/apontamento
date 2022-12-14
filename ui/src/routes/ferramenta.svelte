<script>
  // @ts-nocheck
  import ModalConfirmation from "../components/modal/modalConfirmation.svelte";
  let imageLoader = "/images/axonLoader.gif";
  let urlString = `/api/v1/tools`;
  let urlFer = `/api/v1/ferselecionadas`;
  let tools = [];
  let loader = true;
  getTools();
  let fer = [];
  let adicionados = 0;
  let arrayComp = [];
  let breadFer;
  let message = "";

  async function ferSelected() {
    loader = true;
    const res = await fetch(urlFer);
    fer = await res.json();

    if (res) {
      if (fer.message === "ferramentas selecionadas com successo") {
        window.location.href = "/#/codigobarras/apontamento";
        location.reload();
      } else if (fer.message !== "") {
        message = fer.message;
      }
    }
  }

  async function getTools() {
    const res = await fetch(urlString);
    tools = await res.json();
    console.log("tools linha 28", tools);

    if (tools) {
      loader = false;
      if (
        tools.message == "Pointed Iniciated" ||
        tools.message === "Fin Setup" ||
        tools.message === "" ||
        tools.message === "/images/sem_imagem.gif"
      ) {
        loader = true;
        ferSelected();
      }

      if (tools.message === "Data not found") {
        loader = true;
        window.location.href = "/#/codigobarras/apontamento";
        location.reload();
        ferSelected();
      }

      if (tools.message === "Erro ao tentar acessar as fotos de ferramentas") {
        window.location.href = "/#/codigobarras/apontamento";
        location.reload();
        loader = false;
      }
    } else {
      message = "Algo deu errado";
    }
  }

  function checkIfclicked(column, imgId) {
    if (!arrayComp.includes(column)) {
      adicionados += 1;
      arrayComp.push(column);
      document.getElementById(imgId).style.border = "2px solid green";
      document.getElementById(imgId).style.transition = "1px";
    }
    if (tools.length === arrayComp.length) {
      loader = true;
      ferSelected();
    }
  }

  function close() {
    window.location.href = "/#/codigobarras";
    location.reload();
  }
</script>

{#if breadFer === true}
  <nav class="breadcrumb" aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <a href="/#/codigobarras">Colaborador</a>
      </li>
    </ol>
  </nav>
{/if}
{#if loader === true}
  <div class="imageLoader">
    <div class="loader">
      <img src={imageLoader} alt="" />
    </div>
  </div>
{/if}
{#await tools}
  <div class="imageLoader">
    <div class="loader">
      <img src={imageLoader} alt="" />
    </div>
  </div>
{:then item}
  <div class="content">
    <h3>Selecione as Ferramentas para a produção</h3>
    <div class="itens">
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
  </div>
{/await}

{#if message === "Erro ao tentar acessar as fotos de ferramentas"}
  <ModalConfirmation on:message={close} />
{/if}

<!-- {#if message === "Algo deu errado"}
  <ModalConfirmation on:message={close} />
{/if} -->

{#if message !== ""}
  <ModalConfirmation on:message={close} />
{/if}

<style>
  .breadcrumb {
    margin-top: 5px;
    margin-left: 1%;
    margin-bottom: 0%;
    text-decoration: underline;
  }
  h3 {
    z-index: 5;
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
    z-index: 99999999999999999999999999999999999;
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
    z-index: 99999999999999999999999999999999999;
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

  .itens {
    display: flex;
    flex-direction: row;
    z-index: 2;
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
    z-index: 1;
  }
  img {
    z-index: 1;
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
    z-index: 3;
  }
  /* 
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
  /* }

  @media screen and (min-width: 1600px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
    /* .subtitle {
      font-size: 20px;
    } */
</style>
