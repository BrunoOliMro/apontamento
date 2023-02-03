<script>
  // @ts-nocheck
  import ModalConfirmation from "../../src/components/modal/modalConfirmation.svelte";
  import CallViewAddress from "../components/components/callViewAddress.svelte";
  import ReturnBarcode from "../components/components/returnBarcode.svelte";
  import ViewAddress from "../components/components/viewAddress.svelte";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import InputArea from "../components/components/inputArea.svelte";
  import { verifyStringLenght } from "../utils/verifyLength";
  import messageQuery from "../utils/checkMessage";
  import post from "../utils/postFunction";
  const apiConnect = `http://192.168.97.108:3000/back/api/v1/stop/machine`;
  const apiCallMotiveReturn = `/api/v1/returnMotives`;
  const returnedValueApi = `/api/v1/returnedValue`;
  const back = "/images/icons8-go-back-24.png";
  const imageLoader = "/images/axonLoader.gif";
  const redirectRoute = "/api/v1/clearAll";
  const breadcrumbTitle = "Colaborador";
  const urlBagde = `/api/v1/badge`;
  const barcodeUrl = `/api/v1/odf`;
  const title = "APONTAMENTO";
  const titleBarcode = "CÓDIGO DE BARRAS DA ODF";
  const titleEmployee = `COLABORADOR`;
  const continueee = "Continuar";
  const addressApi = `/api/v1/address`;
  let breadcrumbModal = false;
  let barcodeModal = false;
  let returnModal = false;
  let badgeModal = true;
  let loader = false;
  let barcodeReturn = messageQuery(0);
  let barcode = messageQuery(0);
  let message = messageQuery(0);
  let resultAddress = null;
  let address = false;
  let resultRedirect;
  callReturnMotive();
  let valueStorage;
  let supervisor;
  let quantity;
  let connect;
  let motive;
  let motives;
  let badge;

  async function callConnect(connect) {
    await post(apiConnect, { connect });
  }

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
      loader = false;

      console.log("barcode", res);

      if (res.message === messageQuery(36)) {
        return (message = messageQuery(36));
      }

      if (res.status && res.message === "Não é a máquina a operar") {
        connect = { message: res.message, machine: res.machine };
        return callConnect(connect);
      }

      if (
        (res.data === messageQuery(36) && res.code === messageQuery(10)) ||
        res.code === messageQuery(11)
      ) {
        return (window.location.href = messageQuery(18));
      }

      if (res.code === messageQuery(16) || res.code === messageQuery(27)) {
        return (window.location.href = messageQuery(17));
      }

      if (res.code === messageQuery(0) && res.message === messageQuery(39)) {
        return (message = messageQuery(39));
      }

      if (
        res.code === messageQuery(12) ||
        res.code === messageQuery(13) ||
        res.code === messageQuery(15)
      ) {
        return (message = res.data);
      }

      if (res.code !== messageQuery(0)) {
        return (message = res.code);
      }
    }
  }

  async function checkBadge(event) {
    const resultVerifyBadge = await verifyStringLenght(
      event.detail.eventType,
      badge,
      6,
      14
    );

    if (resultVerifyBadge === messageQuery(1)) {
      loader = true;

      const res = await post(urlBagde, { badge });

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
    } else if (resultVerifyBadge === messageQuery(8)) {
      returnModal = false;
      message = resultVerifyBadge;
    }
  }

  function returnValue() {
    if (returnModal === false) {
      barcodeModal = false;
      returnModal = true;
    } else {
      barcodeModal = true;
      returnModal = false;
    }
  }

  function callRe() {
    window.location.href = messageQuery(19);
  }

  async function showBarcodeAddress() {
    if (address === false) {
      barcodeModal = false;
      address = true;
    } else {
      barcodeModal = true;
      address = false;
      resultAddress = null;
    }
  }

  async function seeAddress(event) {
    if (event.detail.text === "Close modal call view address") {
      breadcrumbModal = true;
      badgeModal = false;
      returnModal = false;
      message = messageQuery(0);
      barcodeModal = true;
      address = false;
      resultAddress = null;
      address = false;
      resultAddress = messageQuery(0);
      supervisor = messageQuery(0);
      (badge = messageQuery(0)), (barcode = messageQuery(0));
    }

    const resultVerifyBadge = await verifyStringLenght(
      event.detail.eventType,
      supervisor,
      6,
      14
    );

    if (resultVerifyBadge) {
      if (barcode) {
        loader = true;
        resultAddress = await post(addressApi, { barcode, supervisor });
        address = false;
        loader = false;
      }
    }
  }

  async function returningValues(event) {
    if (event.detail.text === "CloseButton!") {
      breadcrumbModal = true;
      badgeModal = false;
      barcodeModal = true;
      return returnValue();
    }

    loader = true;
    const res = await post(returnedValueApi, {
      valueStorage: !valueStorage ? messageQuery(0) : valueStorage,
      supervisor: !supervisor ? messageQuery(0) : supervisor,
      quantity: !quantity ? messageQuery(0) : quantity,
      barcodeReturn: !barcodeReturn ? messageQuery(0) : barcodeReturn,
      motives: !motives ? messageQuery(0) : motives,
    });
    barcodeReturn = messageQuery(0);
    supervisor = messageQuery(0);
    quantity = messageQuery(0);
    valueStorage = messageQuery(0);
    returnModal = false;
    if (res.message !== messageQuery(0)) {
      loader = false;
      returnModal = false;
      message = res.message;
    }
  }

  async function redirectToBarcode(event) {
    address = false;
    breadcrumbModal = false;
    barcodeModal = false;
    badgeModal = true;
    returnModal = false;
    resultAddress = null;
    message = messageQuery(0);
    (supervisor = messageQuery(0)((badge = messageQuery(0)))),
      (barcode = messageQuery(0));
    const res = await fetch(redirectRoute);
    resultRedirect = await res.json();
    if (resultRedirect.message === messageQuery(1)) {
      window.location.href = messageQuery(20);
    }
  }

  function close() {
    (badge = messageQuery(0)), (barcode = messageQuery(0));
    loader = true;
    returnModal = false;
    message = messageQuery(0);
    location.reload();
  }

  function closeModal() {
    barcode = messageQuery(0);
    supervisor = messageQuery(0);
    resultAddress = messageQuery(0);
    if (address === false) {
      address = true;
    } else {
      address = false;
    }
  }

  function handleKeydown(e) {
    if (e.key === "Escape") {
      address = false;
      breadcrumbModal = false;
      barcodeModal = false;
      returnModal = false;
      badgeModal = true;
      loader = false;
      message = '';
      badge = '';
      barcode = '';
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

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
        <div class="btn-area">
          <div class="return">
            <button
              on:click={showBarcodeAddress}
              on:keypress={showBarcodeAddress}
              class="btn"
            >
              Endereço
            </button>
          </div>

          <div class="return">
            <button
              on:keypress={returnValue}
              on:click={returnValue}
              class="btn"
            >
              Estornar apontamento
            </button>
          </div>
        </div>
      {/if}
    </div>

    {#if barcodeModal === true}
      <InputArea
        titleInput={titleBarcode}
        on:message={verifyBarcode}
        bind:valueToBind={barcode}
      />
    {/if}

    {#if badgeModal === true}
      <InputArea
        titleInput={titleEmployee}
        on:message={checkBadge}
        bind:valueToBind={badge}
      />
    {/if}
  </div>

  {#if address === true}
    <CallViewAddress
      on:message={seeAddress}
      bind:barcodeAddress={barcode}
      bind:supervisorToCallAddress={supervisor}
    />
  {/if}

  {#if resultAddress && resultAddress !== ""}
    <ViewAddress odfData={resultAddress} on:message={closeModal} />
  {/if}

  {#if returnModal === true && barcodeModal === false}
    <ReturnBarcode
      motiveToBind={motive}
      motivesToBind={motives}
      bind:quantity
      bind:supervisor
      bind:valueStorage
      bind:barcodeReturn
      on:message={returningValues}
    />
  {/if}

  {#if message && message === messageQuery(51)}
    <ModalConfirmation
      title={message}
      {message}
      btnTitle={continueee}
      on:message={callRe}
    />
  {/if}

  {#if message && message !== messageQuery(0) && message !== messageQuery(51)}
    <ModalConfirmation title={message} {message} on:message={close} />
  {/if}
</main>

<style>
  .btn-area {
    display: flex;
    margin: 0%;
    padding: 0%;
    flex-direction: row;
    justify-content: right;
    text-align: right;
    text-align: right;
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
  .return {
    display: flex;
    margin-left: 1%;
    padding: 0%;
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
</style>
