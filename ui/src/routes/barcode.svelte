<script>
  // @ts-nocheck
  import ModalConfirmation from "../../src/components/modal/modalConfirmation.svelte";
  import blockForbiddenChars from "../utils/presanitize";
  import { verifyStringLenght } from "../utils/verifyLength";
  import post from "../utils/postFunction";
  let returnedValueApi = `/api/v1/returnedValue`;
  let apiCallMotiveReturn = `/api/v1/returnMotives`;
  let imageLoader = "/images/axonLoader.gif";
  let urlBagde = `/api/v1/badge`;
  let barcodeUrl = `/api/v1/odf`;
  let back = "/images/icons8-go-back-24.png";
  let title = "APONTAMENTO";
  let returnModal = false;
  let badgeModal = true;
  let barcodeModal = false;
  let breadcrumbModal = false;
  let loader = false;
  let barcodeReturn = "";
  let barcode = "";
  let badge = "";
  let valueStorage;
  let supervisor;
  let quantity;
  let message = "";
  let motive;
  let motives;
  const messageObj = {
    sucess: "Success",
    generalError: "Algo deu errado",
    invalidBadge: "Crachá inválido",
    invalidChars: "Não atende aos requisitos de caracteres",
    prodIni: "Ini Prod",
    pointed: "Pointed",
    ripIni: "Rip iniciated",
    newProcess: "Begin new process",
    pointedIni: "Pointed Iniciated",
    finSetup: "Fin Setup",
    returned: "A value was returned",
    machineStop: "Machine has stopped",
    pointUrl: "/#/codigobarras/apontamento",
    ripUrl: "/#/rip",
    toolsUrl: "/#/ferramenta",
  };
  callReturnMotive();

  async function callReturnMotive() {
    const res = await fetch(apiCallMotiveReturn);
    motives = await res.json();
    if (!motives) {
      motives = ["Erro de apontamento"];
    }
  }

  async function verifyBarcode(event) {
    const verifyBarcode = await verifyStringLenght(event, barcode, 16, 20);
    if (verifyBarcode === messageObj.sucess) {
      loader = true;
      const res = await post(barcodeUrl, barcode);
      if (res) {
        if (res.message === messageObj.prodIni) {
          window.location.href = messageObj.pointUrl;
        } else if (
          res.message === messageObj.ripIni ||
          res.message === messageObj.pointed
        ) {
          window.location.href = messageObj.ripUrl;
        } else if (
          res.message === messageObj.newProcess ||
          res.message === messageObj.pointedIni ||
          res.message === messageObj.finSetup ||
          res.message === messageObj.returned
        ) {
          window.location.href = messageObj.toolsUrl;
        } else if (res.message === messageObj.machineStop) {
          window.location.href = messageObj.pointUrl;
        } else if (res.message !== "") {
          loader = false;
          message = res.message;
        }
      }
    }
  }

  async function checkBadge(event) {
    const resultVerifyBadge = await verifyStringLenght(event, badge, 6, 8);
    if (resultVerifyBadge === messageObj.sucess) {
      loader = true;
      const res = await post(urlBagde, badge);
      if (res) {
        loader = false;
        if (res.message) {
          if (res.message === messageObj.sucess) {
            barcodeModal = true;
            badgeModal = false;
            breadcrumbModal = true;
          } else if (res.message !== "") {
            returnModal = false;
            message = res.message;
          } else {
            message = messageObj.generalError;
          }
        }
      }
    } else if (resultVerifyBadge === messageObj.invalidBadge) {
      returnModal = false;
      message = resultVerifyBadge;
    } else if (resultVerifyBadge === messageObj.invalidChars) {
      returnModal = false;
      message = resultVerifyBadge;
    }
  }

  function returnValue() {
    if (returnModal === false) {
      returnModal = true;
    } else {
      returnModal = false;
    }
  }

  async function returningValues() {
    loader = true;
    const res = await post(returnedValueApi, {
      valueStorage: !valueStorage ? "" : valueStorage,
      supervisor: !supervisor ? "" : supervisor,
      quantity: !quantity ? "" : quantity,
      barcodeReturn: !barcodeReturn ? "" : barcodeReturn,
      motive: !motive ? "" : motive,
    });
    barcodeReturn = "";
    supervisor = "";
    quantity = "";
    valueStorage = "";
    returnModal = false;
    loader = false;
    if (res.message !== "") {
      returnModal = false;
      message = res.message;
    }
    console.log("res", res);
  }

  function redirectToBarcode() {
    breadcrumbModal = false;
    barcodeModal = false;
    badgeModal = true;
    badge = "";
    barcode = "";
    message = "";
  }
  function close() {
    loader = true;
    returnModal = false;
    message = "";
    location.reload();
    loader = false;
  }
</script>

<main>
  {#if breadcrumbModal === true}
    <nav class="breadcrumb" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="/#/codigobarras" on:click={redirectToBarcode}>
            <img src={back} alt="" />Colaborador</a
          >
        </li>
      </ol>
    </nav>
  {/if}

  <div>
    <div>
      <div class="title-div">
        <h1 class="title">{title}</h1>
      </div>

      {#if loader === true}
        <div class="image-loader">
          <div class="loader">
            <img src={imageLoader} alt="" />
          </div>
        </div>
      {/if}

      {#if barcodeModal === true}
        <div class="return">
          <button on:keypress={returnValue} on:click={returnValue} class="btn">
            Estornar Valores
          </button>
        </div>
      {/if}
    </div>

    {#if barcodeModal === true}
      <div class="form-div">
        <div id="pop-up-badge">
          <div id="title">CÓDIGO DE BARRAS DA ODF</div>
          <!-- svelte-ignore a11y-autofocus -->
          <input
            autocomplete="off"
            autofocus
            on:keypress={verifyBarcode}
            on:input|preventDefault={blockForbiddenChars}
            bind:value={barcode}
            onkeyup="this.value = this.value.toUpperCase()"
            type="text"
          />
        </div>
      </div>
    {/if}

    {#if badgeModal === true}
      <div class="form-div">
        <div id="pop-up-badge">
          <div id="title">COLABORADOR</div>
          <!-- svelte-ignore a11y-autofocus -->
          <input
            autocomplete="off"
            autofocus
            on:keypress={checkBadge}
            on:input|preventDefault={blockForbiddenChars}
            bind:value={badge}
            onkeyup="this.value = this.value.toUpperCase()"
            type="text"
          />
        </div>
      </div>
    {/if}
  </div>

  {#if returnModal === true}
    <div class="background-modal">
      <div class="modal-div">
        <div class="line">
          <p>Código de barras da ODF:</p>
          <!-- svelte-ignore a11y-positive-tabindex -->
          <!-- svelte-ignore a11y-autofocus -->
          <input
            on:input={blockForbiddenChars}
            bind:value={barcodeReturn}
            autofocus
            autocomplete="off"
            class="return-input"
            onkeyup="this.value = this.value.toUpperCase()"
            type="text"
            tabindex="14"
          />
        </div>

        <div class="line">
          <p>Insira a quantidade que deseja estornar:</p>
          <!-- svelte-ignore a11y-positive-tabindex -->
          <input
            on:input={blockForbiddenChars}
            bind:value={quantity}
            autocomplete="off"
            class="return-input"
            onkeyup="this.value = this.value.toUpperCase()"
            type="text"
            tabindex="15"
          />
        </div>

        <div class="line">
          <p>Crachá do Supervisor:</p>
          <!-- svelte-ignore a11y-positive-tabindex -->
          <input
            bind:value={supervisor}
            on:input={blockForbiddenChars}
            autocomplete="off"
            tabindex="16"
            class="return-input"
            onkeyup="this.value = this.value.toUpperCase()"
            type="text"
          />
        </div>

        <div class="line">
          <p>Qual irá retornar:</p>
          <div class="options">
            <!-- svelte-ignore a11y-positive-tabindex -->
            <select tabindex="17" bind:value={valueStorage}>
              <option>BOAS</option>
              <option>RUINS</option>
            </select>
          </div>
        </div>

        <div class="line">
          <p>Qual o motivo do estorno:</p>
          <select bind:value={motive}>
            {#each motives as item}
              <option>{item}</option>
            {/each}
          </select>
        </div>

        <div class="line-btn">
          <!-- svelte-ignore a11y-positive-tabindex -->
          <p
            tabindex="19"
            on:keypress|preventDefault={close}
            on:click|preventDefault={close}
          >
            Fechar
          </p>
          <!-- svelte-ignore a11y-positive-tabindex -->
          <p
            tabindex="18"
            on:keypress|preventDefault={returningValues}
            on:click|preventDefault={returningValues}
          >
            Confirmar
          </p>
        </div>
      </div>
    </div>
  {/if}

  {#if message !== ""}
    <ModalConfirmation title={message} on:message={close} />
  {/if}
</main>

<style>
  .line-btn {
    margin: 1%;
    padding: 0%;
    display: flex;
    flex-direction: row;
    justify-content: right;
    align-items: right;
    text-align: right;
    width: 100%;
    height: 100px;
  }
  .line {
    margin: 0%;
    padding: 0%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    height: 100px;
  }
  .modal-div {
    margin: 0%;
    padding: 0%;
    color: white;
    background-color: black;
    width: 850px;
    height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 10px;
    z-index: 9;
  }
  a {
    color: #252525;
    font-size: 20px;
  }

  a:hover {
    opacity: 0.5s;
    transition: all 1s;
  }
  .breadcrumb {
    margin-top: 5px;
    margin-left: 0%;
    margin-bottom: 0%;
    text-decoration: underline;
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
  }

  button {
    letter-spacing: 0.5px;
    width: fit-content;
    height: 28px;
    border: none;
    color: white;
    background-color: transparent;
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
    z-index: 999999999999;
  }
  input {
    margin: 1%;
    padding: 0%;
    border-radius: 8px;
  }

  select {
    margin: 1%;
    padding: 0%;
    width: 120px;
    border-radius: 8px;
    color: #fff;
    background-color: #252525;
  }
  .return-input {
    margin: 0%;
    padding: 0%;
    height: 30px;
    width: 250px;
    border-radius: 8px;
  }
  p {
    font-size: 30px;
    margin: 1%;
    padding: 0%;
    display: flex;
    justify-content: center;
    text-decoration: none;
    color: #fff;
  }
  .form-div {
    height: 180px;
    letter-spacing: 1px;
    border-color: grey;
    box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
  }
  .background-modal {
    margin: 0%;
    padding: 0%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(17, 17, 17, 0.618);
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    z-index: 8;
  }

  .return {
    display: flex;
    justify-content: flex-end;
    text-align: center;
    align-items: center;
    color: black;
    background-color: transparent;
  }

  .btn {
    outline: none;
    margin: 0%;
    padding: 0%;
    width: 250px;
    height: 30px;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    border-radius: 6px;
    background-color: white;
    border: none;
    color: black;
    border-color: #999999;
    box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
    letter-spacing: 1px;
  }

  .btn:hover {
    cursor: pointer;
    background-color: white;
    color: blue;
    transition: all 0.2s;
  }

  main {
    margin: 1%;
  }

  #pop-up-badge {
    margin: 1%;
    padding: 0%;
    padding: 15px;
    height: 180px;
    font-size: 35px;
    border-radius: 5px;
    color: black;
    justify-content: center;
    text-align: center;
    align-items: center;
  }
</style>
