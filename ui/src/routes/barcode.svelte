<script>
  // @ts-nocheck
  import ModalConfirmation from "../../src/components/modal/modalConfirmation.svelte";
  import { verifyStringLenght } from "../utils/verifyLength";
  import post from "../utils/postFunction";
  import messageQuery from "../utils/checkMessage";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import ReturnBarcode from "../components/components/returnBarcode.svelte";
  import InputArea from "../components/components/inputArea.svelte";
  import ViewAddress from "../components/components/viewAddress.svelte";
  import CallViewAddress from "../components/components/callViewAddress.svelte";
  const apiCallMotiveReturn = `/api/v1/returnMotives`;
  const returnedValueApi = `/api/v1/returnedValue`;
  const back = "/images/icons8-go-back-24.png";
  const imageLoader = "/images/axonLoader.gif";
  const redirectRoute = "/api/v1/clearAll";
  const breadcrumbTitle = "Colaborador";
  const urlBagde = `/api/v1/badge`;
  const barcodeUrl = `/api/v1/odf`;
  const title = "APONTAMENTO";
  let returnModal = false;
  let badgeModal = true;
  let barcodeModal = false;
  let breadcrumbModal = false;
  let loader = false;
  let barcodeReturn = "";
  let barcode = "";
  let message = "";
  let valueStorage;
  let supervisor;
  let quantity;
  let motive;
  let motives;
  let badge;
  const titleBarcode = "CÓDIGO DE BARRAS DA ODF";
  const titleEmployee = `COLABORADOR`;
  let resultRedirect;
  const addressApi = `/api/v1/address`;
  let address = false;
  let resultAddress = null;

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
          if (res.data === messageQuery(36) && res.code === messageQuery(10)) {
            return (window.location.href = messageQuery(18));
          }

          if (res.code === messageQuery(10)) {
            return (window.location.href = messageQuery(18));
          }

          if (res.code === messageQuery(16)) {
            return (window.location.href = messageQuery(17));
          }

          if (
            res.code === messageQuery(0) &&
            res.message === messageQuery(39)
          ) {
            return (message = messageQuery(39));
          }

          if (res.code === messageQuery(10) || res.code === messageQuery(11)) {
            return (window.location.href = messageQuery(18));
          }

          if (res.code === messageQuery(36)) {
            return (message = messageQuery(36));
          }

          if (
            res.code === messageQuery(12) ||
            res.code === messageQuery(13) ||
            res.code === messageQuery(15)
          ) {
            return (window.location.href = messageQuery(19));
          }

          if (res.code === messageQuery(27)) {
            return (window.location.href = messageQuery(17));
          }

          if (res.code !== messageQuery(0)) {
            return (message = res.code);
          }
        } else if (
          res.code === messageQuery(12) ||
          res.code === messageQuery(13) ||
          res.code === messageQuery(14) ||
          res.code === messageQuery(15)
        ) {
          window.location.href = messageQuery(19);
        } else if (res.code === messageQuery(16)) {
          window.location.href = messageQuery(17);
        } else if (res.code !== messageQuery(0)) {
          message = res.message;
        }
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
      barcodeModal = false;
      returnModal = true;
    } else {
      barcodeModal = true;
      returnModal = false;
    }
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
      message = "";
      barcodeModal = true;
      address = false;
      resultAddress = null;
      address = false;
      resultAddress = "";
      supervisor = "";
      badge = "",
      barcode = ""
    }

    const resultVerifyBadge = await verifyStringLenght(
      event.detail.eventType,
      supervisor,
      6,
      14
    );

    if (resultVerifyBadge) {
      if(barcode){
        loader = true
        resultAddress = await post(addressApi, { barcode, supervisor });
        address = false;
        loader = false
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
  }

  async function redirectToBarcode(event) {
    address = false;
    breadcrumbModal = false;
    barcodeModal = false;
    badgeModal = true;
    returnModal = false;
    resultAddress = null;
    barcode = "";
    message = "";
    (supervisor = ""((badge = ""))), (barcode = "");
    const res = await fetch(redirectRoute);
    resultRedirect = await res.json();
    if (resultRedirect.message === messageQuery(1)) {
      window.location.href = messageQuery(20);
    }
  }

  function close() {
    (badge = ""), (barcode = "");
    loader = true;
    returnModal = false;
    message = "";
    location.reload();
  }

  function closeModal () {
    barcode = '';
    supervisor = '';
    resultAddress = '';
    if(address === false){
      address = true
    } else {
      address = false
    }
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
    <ViewAddress odfData={resultAddress} on:message={closeModal}/>
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

  {#if message && message !== messageQuery(0)}
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
