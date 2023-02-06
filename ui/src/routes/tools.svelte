<script>
  // @ts-nocheck
  // import ModalConfirmation from "../components/modal/modalConfirmation.svelte";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Message from "../components/components/message.svelte";
  import messageQuery from "../utils/checkMessage";
  const selectedToolsApi = `/api/v1/ferselecionadas`;
  const back = "/images/icons8-go-back-24.png";
  const imageLoader = "/images/axonLoader.gif";
  const toolsApi = `/api/v1/tools`;
  const continuer = `Continuar`;
  const title = "Colaborador";
  let selectedTools = [];
  let loader = true;
  let message = "";
  let tools = [];
  let array = [];
  let added = 0;
  const result = getTools();

  async function callTools() {
    loader = true;
    console.log("call tools");
    const res = await fetch(selectedToolsApi);
    selectedTools = await res.json();
    console.log("selectedTools", selectedTools);
    loader = false;
    if (selectedTools.data === messageQuery(10)) {
      return (window.location.hred = messageQuery(18));
    }

    if (selectedTools.status === messageQuery(1)) {
      if (selectedTools.message === messageQuery(1)) {
        window.location.href = messageQuery(17);
      } else if (selectedTools.message !== messageQuery(0)) {
        message = selectedTools.message;
      }
    }
  }

  async function getTools() {
    loader = true;
    const res = await fetch(toolsApi);
    tools = await res.json();
    console.log("tools", tools);
    loader = false;

    if (tools.data.length > 0) {
      return (message = messageQuery(1));
    }

    if (
      tools.message === messageQuery(32) ||
      tools.message === messageQuery(27) ||
      tools.message === messageQuery(28) ||
      tools.message === messageQuery(29) ||
      tools.message === messageQuery(0) ||
      tools.message === messageQuery(30) ||
      tools.message === messageQuery(31) ||
      tools.message === messageQuery(1)
    ) {
      message = messageQuery(32);
    }
  }

  async function checkIfclicked(column, imgId) {
    if (!array.includes(column)) {
      added += 1;
      array.push(column);
      document.getElementById(imgId).style.border = "2px solid green";
      document.getElementById(imgId).style.transition = "1px";
    }
    if (tools.data.length === array.length) {
      loader = true;
      callTools();
    }
  }

  // function close() {
  //   window.location.href = messageQuery(20);
  //   location.reload();
  // }

  async function redirectToBarcode() {
    loader = true;
    window.location.href = messageQuery(20);
  }

  async function handleKeydown(e) {
    if (e.key === "Escape") {
      window.location.href = messageQuery(20);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if loader === true}
  <div class="image-loader">
    <div class="loader">
      <img src={imageLoader} alt="" />
    </div>
  </div>
{/if}


<div class="breadcrumb">
  <Breadcrumb
    imgResource={back}
    titleBreadcrumb={title}
    on:message={redirectToBarcode}
  />
</div>

{#await result}
  <div class="image-loader">
    <div class="loader">
      <img src={imageLoader} alt="" />
    </div>
  </div>
{:then}
  <div class="content">
    {#if tools.data.length > 0 && message === messageQuery(1)}
      <h3>Selecione as ferramentas</h3>
      <div class="itens">
        {#each tools.data as column, i}
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
    {/if}
  </div>
{/await}

{#if message && message === messageQuery(32)}
  <!-- subTitle={continue} -->
  <Message
    titleInMessage={message}
    btnInMessage={continuer}
    on:message={callTools}
  />
{/if}

<!-- {#if message && message !== messageQuery(0) && message !== messageQuery(32) && message !== messageQuery(1)}
  <ModalConfirmation on:message={close} />
{/if} -->

<style>
  .breadcrumb {
    margin-top: 10px;
    margin-left: 10px;
    margin-bottom: 0%;
    margin-right: 0%;
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
  .image-loader {
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
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
    margin: 1%;
    padding: 0%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    z-index: 2;
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
