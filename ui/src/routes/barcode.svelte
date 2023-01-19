<script>
  // @ts-nocheck
  import ModalConfirmation from "../../src/components/modal/modalConfirmation.svelte";
  import { verifyStringLenght } from "../utils/verifyLength";
  import blockForbiddenChars from "../utils/presanitize";
  import post from "../utils/postFunction";
  import messageQuery from "../utils/checkMessage";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import ReturnBarcode from "../components/components/returnBarcode.svelte";
  import InputArea from "../components/components/inputArea.svelte";
  const returnedValueApi = `/api/v1/returnedValue`;
  const apiCallMotiveReturn = `/api/v1/returnMotives`;
  const imageLoader = "/images/axonLoader.gif";
  const urlBagde = `/api/v1/badge`;
  const barcodeUrl = `/api/v1/odf`;
  const back = "/images/icons8-go-back-24.png";
  const title = "APONTAMENTO";
  const breadcrumbTitle = "Colaborador";
  let returnModal = false;
  let badgeModal = true;
  let barcodeModal = false;
  let breadcrumbModal = false;
  let loader = false;
  let barcodeReturn = "";
  let barcode = "";
  let valueStorage;
  let supervisor;
  let quantity;
  let message = "";
  let motive;
  let motives;
  let badge;
  const titleBarcode = "CÓDIGO DE BARRAS DA ODF";
  const titleEmployee = `COLABORADOR`;
  let resultRedirect;
  const redirectRoute = "/api/v1/clearAll";

  callReturnMotive();

  async function callReturnMotive() {
    const res = await fetch(apiCallMotiveReturn);
    motives = await res.json();
    if (motives) {
      if (motives.message === messageQuery(1) && motives.data.data) {
        motives = motives.data.data.map((acc) => acc.DESCRICAO);
      } else {
        motives = ["Erro de apontamento"];
      }
    }
  }

  async function verifyBarcode(event) {
    const verifyBarcode = await verifyStringLenght(
      event.detail.eventType,
      barcode,
      16,
      20
    );
    if (verifyBarcode === messageQuery(1)) {
      loader = true;
      const res = await post(barcodeUrl, { barcode });
      if (res) {
        loader = false;
        if (res.status === messageQuery(1)) {

          if(res.data === messageQuery(10)){
            return window.location.href = messageQuery(18)
          }

          if(res.data === messageQuery(16)){
            return window.location.href = messageQuery(17)
          }

          if(res.data === messageQuery(0) && res.message === messageQuery(39)){
            return message = messageQuery(39)
          }

          if (res.data === messageQuery(10) || res.data === messageQuery(11)) {
            return (window.location.href = messageQuery(18));
          }

          if (res.data === messageQuery(36)) {
            return (message = messageQuery(36));
          }

          if (res.data === messageQuery(12) || res.data === messageQuery(13) || res.data === messageQuery(15)) {
            return (window.location.href = messageQuery(19));
          }

          if (res.data === messageQuery(27)) {
            return (window.location.href = messageQuery(17));
          }

          if (res.data !== messageQuery(0)) {
            return (message = res.data);
          }
        } else if (
          res.data === messageQuery(11) ||
          res.data === messageQuery(10)
        ) {
          window.location.href = messageQuery(18);
        } else if (
          res.data === messageQuery(12) ||
          res.data === messageQuery(13) ||
          res.data === messageQuery(14) ||
          res.data === messageQuery(15)
        ) {
          window.location.href = messageQuery(19);
        } else if (res.data === messageQuery(16)) {
          window.location.href = messageQuery(17);
        } else if (res.data !== messageQuery(0)) {
          loader = false;
          message = res.data;
        }
      }
    }
  }

  async function checkBadge(event) {
    // console.log('event in Badge', event.detail.eventType);
    const resultVerifyBadge = await verifyStringLenght( event.detail.eventType, badge, 6, 14);

    if (resultVerifyBadge === messageQuery(1)) {
      loader = true;

      const res = await post(urlBagde, { badge });

      if (res) {
        loader = false;
        if (res.status === messageQuery(1)) {
          if (res.message === messageQuery(5)) {
            return (message = messageQuery(6));
          }

          barcodeModal = true;
          badgeModal = false;
          breadcrumbModal = true;
        } else if (res.message !== messageQuery(0)) {
          returnModal = false;
          message = res.message;
        } else {
          message = messageQuery(4);
        }
      }
    } else if (resultVerifyBadge === messageQuery(5)) {
      returnModal = false;
      message = resultVerifyBadge;
    } else if (resultVerifyBadge === messageQuery(8)) {
      returnModal = false;
      message = resultVerifyBadge;
    }
  }

  function returnValue() {
    
    if (returnModal === false) {
      barcodeModal = false
      returnModal = true;
    } else {
      barcodeModal = true
      returnModal = false;
    }
  }

  async function returningValues(event) {

    if(event.detail.text === 'CloseButton!'){
      breadcrumbModal = true
      badgeModal = false
      barcodeModal = true
      return returnValue();
    }

    loader = true;
    const res = await post(returnedValueApi, {
      valueStorage: !valueStorage ? "" : valueStorage,
      supervisor: !supervisor ? "" : supervisor,
      quantity: !quantity ? "" : quantity,
      barcodeReturn: !barcodeReturn ? "" : barcodeReturn,
      motives: !motives ? "" : motives,
    });
    barcodeReturn = "";
    supervisor = "";
    quantity = "";
    valueStorage = "";
    returnModal = false;
    if (res.message !== messageQuery(0)) {
      loader = false;
      returnModal = false;
      message = res.message;
    }
    console.log("res", res);
  }

  async function redirectToBarcode(event) {
    breadcrumbModal = false;
    barcodeModal = false;
    badgeModal = true;
    returnModal = false;
    barcode = "";
    message = "";
    (badge = ""), (barcode = "");
    const res = await fetch(redirectRoute);
      resultRedirect = await res.json();
      if (resultRedirect.message === messageQuery(1)) {
         window.location.href = messageQuery(20);
      }
  }

  function close() {
    (badge = ""), (barcode = "");
    // barcodeModal = false
    loader = true;
    returnModal = false;
    message = "";
    location.reload();
    // loader = false;
  }
</script>

<main>
  {#if breadcrumbModal === true}
    <Breadcrumb
      imgResource={back}
      titleBreadcrumb={breadcrumbTitle}
      on:message={redirectToBarcode}
    />
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
      <InputArea titleInput={titleBarcode} on:message={verifyBarcode} bind:valueToBind={barcode}
      />
    {/if}

    {#if badgeModal === true}
      <InputArea titleInput={titleEmployee} on:message={checkBadge} bind:valueToBind={badge}
      />
    {/if}
  </div>

  {#if returnModal === true && barcodeModal === false}
    <ReturnBarcode motiveToBind={motive} motivesToBind={motives}  bind:quantity={quantity} bind:supervisor={supervisor} bind:valueStorage={valueStorage} bind:barcodeReturn={barcodeReturn} on:message={returningValues} />
    <!-- <div class="background-modal">
      <div class="modal-div">
        <div class="line">
          <p>Código de barras da ODF:</p>
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
          <p
            tabindex="19"
            on:keypress|preventDefault={close}
            on:click|preventDefault={close}
          >
            Fechar
          </p>
          <p
            tabindex="18"
            on:keypress|preventDefault={returningValues}
            on:click|preventDefault={returningValues}
          >
            Confirmar
          </p>
        </div>
      </div>
    </div> -->
  {/if}

  {#if message && message !== messageQuery(0)}
    <ModalConfirmation title={message} {message} on:message={close} />
  {/if}
</main>

<style>
  /* .line-btn {
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
  } */
  /* .modal-div {
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
  } */

  /* a:hover {
    opacity: 0.5s;
    transition: all 1s;
  }
  .breadcrumb {
    margin-top: 5px;
    margin-left: 0%;
    margin-bottom: 0%;
    text-decoration: underline;
  } */
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
  /* input {
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
  } */
  /* .return-input {
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
  } */
  /* .form-div {
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
  } */

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

  /* #pop-up-badge {
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
  } */
</style>
