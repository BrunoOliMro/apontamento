<script>
  // @ts-nocheck
  // @ts-nocheck
  import ModalConfirmation from "../../src/components/modal/modalConfirmation.svelte";
  import Title from "../components/title/title.svelte";
  let imageLoader = "/images/axonLoader.gif";
  let codigoBarrasReturn = "";
  let codigoBarras = "";
  let urlS = `/api/v1/apontamento`;
  let urlBagde = `/api/v1/apontamentoCracha`;
  let supervisorApi = "api/v1/supervisorParada";
  let cracha = "";
  let showmodal = false;
  let showCorr = false;
  let returnedValueApi = `/api/v1/returnedValue`;
  let returnValueStorage;
  let superSuperMaqPar;
  let supervisor;
  let quantity;
  let superParada = false;
  // let showError = false;
  // let showBadgeNotFound = false;
  //let bagdeEmpty = false;
  let showBadge = true;
  let showBarcode = false;
  let showSupervisor = false;
  let quantityModal = "";
  //let errorReturnValue = false;
  let returnValueAvailable;
  let paradaMsg = "";
  let barcodeMsg = "";
  let showBreadcrumb = false;
  let loader = false;
  let modalMessage = "";
  //let modalTitle = "Crachaaaaaaaaaaaaaaaaaaa";

  let badgeMsg = "";
  if (window.location.href.includes("?")) {
    badgeMsg = window.location.href.split("?")[1].split("=")[1];
  }

  const doPostSuper = async () => {
    loader = true;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch(supervisorApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        superSuperMaqPar: !superSuperMaqPar ? "" : superSuperMaqPar,
      }),
    }).then((res) => res.json());
    //console.log("linha 54", res);
    if (res.message === "maquina") {
      loader = false;
      window.location.href = "/#/codigobarras";
      location.reload();
    }
    if (res.message === "supervisor não encontrado") {
      modalMessage = "Supervisor não encontrado";
      superParada = false;
      //paradaMsg = "supervisor não encontrado";
      showmodal = false;
    }

    if (res.message === "erro na parada de maquina") {
      modalMessage = "Erro na parada de máquina";
      showmodal = false;
      superParada = false;
      //paradaMsg = "erro na parada de maquina";
    }
  };

  function blockForbiddenChars(e) {
    let value = e.target.value;
    e.target.value = preSanitize(value);
  }
  function preSanitize(input) {
    const allowedChars = /[A-Za-z0-9]/;
    const sanitizedOutput = input
      .split("")
      .map((char) => (allowedChars.test(char) ? char : ""))
      .join("");
    return sanitizedOutput;
  }

  const doPost = async () => {
    loader = true;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch(urlS, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        codigoBarras,
      }),
    }).then((res) => res.json());
    console.log("res", res);
    if (
      res.message === "codeApont 1 setup iniciado" ||
      res.message === "insira cod 1" ||
      res.message === "não foi necessario reservar" ||
      res.message === "valores reservados"
    ) {
      loader = false;
      window.location.href = "/#/ferramenta";
    }

    if (res.message === "codeApont 3 prod iniciado") {
      //console.log("linha 118 barcode");
      loader = false;
      window.location.href = "/#/codigobarras/apontamento";
    }
    if (res.message === "codeApont 4 prod finalzado") {
      window.location.href = "/#/rip";
    }
    if (res.message === "codeApont 5 maquina parada") {
      //console.log("linha 128");
      loader = false;
      superParada = true;
    }
    if (res.message === "codigo de barras vazio") {
      modalMessage = "Código de barras vazio";
      //barcodeMsg = "codigo de barras vazio";
    }
    if (res.message === "odf não encontrada") {
      modalMessage = "ODF não encontrada";
      loader = false;
      //barcodeMsg = "odf não encontrada";
    }
    if (res.message === "não há limite na odf") {
      modalMessage = "Não há limite na ODF";
      loader = false;
      //barcodeMsg = "não há limite na odf";
    }
  };

  function writeOnHand(event) {
    if (event.key === "Enter" && codigoBarras.length >= 16) {
      doPost();
    }
  }

  function checkBeforeBadge(event) {
    if (cracha.length >= 6 && event.key === "Enter") {
      if (cracha === "000000") {
        modalMessage = "Crachá inválido";
      }
      checkBagde();
    }
  }

  const checkBagde = async () => {
    loader = true;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch(urlBagde, {
      method: "POST",
      body: JSON.stringify({
        cracha,
      }),
      headers,
    }).then((res) => res.json());
    loader = false;
    console.log("linha 165", res);
    if (res.message === "cracha encontrado") {
      showBarcode = true;
      showBadge = false;
      showBreadcrumb = true;
    }
    if (res.message === "cracha não encontrado") {
      modalMessage = "Crachá não encontrado";
    }
    if (res.message === "codigo de matricula vazia") {
      modalMessage = "Crachá vazio";
    }
  };

  function closePop() {
    modalMessage = ''
    //document.getElementById("s").style.display = "none";
    window.location.href = "/#/codigobarras";
    location.reload();
  }
  function returnValue() {
    if (showmodal === false) {
      showmodal = true;
    } else {
      showmodal = false;
    }
  }
  async function doReturn() {
    loader = true;
    const res = await fetch(returnedValueApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        returnValueStorage: returnValueStorage,
        supervisor: supervisor,
        quantity: quantity,
        codigoBarrasReturn: !codigoBarrasReturn ? "" : codigoBarrasReturn,
      }),
    }).then((res) => res.json());
    loader = false;
    if (res.message === "supervisor esta vazio") {
      modalMessage = "Campo supervisor está vazio";
      showSupervisor = true;
      showmodal = false;
      //location.reload();
    }
    if (res.message === "estorno feito") {
      modalMessage = "Estorno realizado";
      showmodal = false;
      //showCorr = true;
      window.location.href = "/#/codigobarras";
      //location.reload();
    }
    if (res.message === "erro de estorno") {
      modalMessage === "Erro ao fazer estorno";
      //errorReturnValue = true;
      showmodal = false;
      //location.reload();
    }
    if (res.message === "quantidade esta vazio") {
      modalMessage = "Quantidade esta vazia";
      quantityModal = "quantidade esta vazio";
      showmodal = false;
      //location.reload();
    }
    if (res.message === "codigo de barras vazio") {
      modalMessage === "Código de barras está vazio";
      //barcodeMsg = "codigo de barras vazio";
      showmodal = false;
    }
    if (res.message === "odf não encontrada") {
      modalMessage === "ODF não encontrada";
      //barcodeMsg = "odf não encontrada";
      showmodal = false;
    }
    if (res.message === "não ha valor que possa ser devolvido") {
      modalMessage === "Não há valor a ser devolvido";
      //barcodeMsg = "não ha valor que possa ser devolvido";
      showmodal = false;
    }
    if (res.String === "valor devolvido maior que o permitido") {
      modalMessage === "Limite de estorno excedido";
      //barcodeMsg = "valor devolvido maior que o permitido";
      returnValueAvailable = res.qtdLibMax;
      showmodal = false;
    }
  }

  function closePopCor() {
    barcodeMsg = "";
    paradaMsg = "";
    //errorReturnValue = false;
    showSupervisor = false;
    quantityModal = "";
    showCorr = false;
    showmodal = false;
    modalMessage = "";
    location.reload();
  }

  function goBack() {
    showBreadcrumb = false;
    showBarcode = false;
    showBadge = true;
    cracha = "";
    codigoBarras = "";
    modalMessage = "";
  }
</script>

<main>
  {#if showBreadcrumb === true}
    <nav class="breadcrumb" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="/#/codigobarras" on:click={goBack}>Colaborador</a>
        </li>
      </ol>
    </nav>
  {/if}

  <div>
    <div>
      <Title />

      {#if loader === true}
        <div class="imageLoader">
          <div class="loader">
            <img src={imageLoader} alt="" />
          </div>
        </div>
      {/if}

      {#if showBarcode === true}
        <div class="return">
          <button
            on:keypress={returnValue}
            on:click={returnValue}
            class="sideButton"
          >
            Estornar Valores
          </button>
        </div>
      {/if}
    </div>

    {#if superParada === true}
      <div class="modalBackground">
        <div class="confirmationModal" >
          <h5>Maquina parada selecione um supervisor</h5>
          <input
            autofocus
            tabindex="12"
            id="supervisor"
            name="supervisor"
            type="text"
            on:input={blockForbiddenChars}
            onkeyup="this.value = this.value.toUpperCase()"
            bind:value={superSuperMaqPar}
          />
          <p tabindex="13" on:keypress={doPostSuper} on:click={doPostSuper}>
            Confirmar
          </p>
        </div>
      </div>
    {/if}

    {#if modalMessage === "Estorno realizado"}
      <ModalConfirmation title={modalMessage} on:message={closePopCor} />
      <!-- <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Estorno Feito</h5>
          <p
            autofocus
            tabindex="30"
            on:keypress={closePopCor}
            on:click={closePopCor}
          >
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Erro ao fazer estorno"}
      <ModalConfirmation on:message={closePopCor} title={modalMessage} />
      <!-- <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Erro ao fazer estorno</h5>
          <p
            autofocus
            tabindex="31"
            on:keypress={closePopCor}
            on:click={closePopCor}
          >
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Não há valor a ser devolvido"}
      <ModalConfirmation on:message={closePopCor} title={modalMessage} />
      <!-- <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Não há limite para Estorno</h5>
          <p
            autofocus
            tabindex="32"
            on:keypress={closePopCor}
            on:click={closePopCor}
          >
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Supervisor não encontrado"}
      <ModalConfirmation on:message={closePopCor} title={modalMessage} />
      <!-- <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Supervisor não encontrado</h5>
          <p
            autofocus
            tabindex="33"
            on:keypress={closePopCor}
            on:click={closePopCor}
          >
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Limite de estorno excedido"}
      <ModalConfirmation on:message={closePopCor} title={modalMessage} />
      <!-- <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Limite de estorno menor que o apontado</h5>
          <h3>Limite Disponivel: {returnValueAvailable}</h3>
          <p
            autofocus
            tabindex="34"
            on:keypress={closePopCor}
            on:click={closePopCor}
          >
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Não há limite na ODF"}
      <ModalConfirmation on:message={closePop} title={modalMessage} />
      <!-- <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>ODF não pode ser apontada, aponte outra</h5>
          <p autofocus tabindex="35" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "ODF não encontrada"}
      <ModalConfirmation on:message={closePop} title={modalMessage} />
      <!-- <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>ODF não encontrada</h5>
          <p autofocus tabindex="23" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Código de barras está vazio"}
      <ModalConfirmation on:message={closePop} title={modalMessage} />

      <!-- <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Codigo de barras vazio</h5>
          <p autofocus tabindex="24" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Crachá não encontrado"}
      <ModalConfirmation on:message={closePop} title={modalMessage} />
      <!-- <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Crachá não encontrado</h5>
          <p autofocus tabindex="25" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Crachá vazio"}
      // bagdeEmpty === true
      <ModalConfirmation on:message={closePop} title={modalMessage} />
      <!-- {#if showInvalidBagde === true} -->
      <!-- <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Crachá vazio</h5>
          <p autofocus tabindex="26" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Quantidade está vazia"}
      <ModalConfirmation on:message={closePop} title={modalMessage} />
      <!-- <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Quantidade indefinida</h5>
          <p autofocus tabindex="26" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Campo supervisor está vazio"}
      <!-- {#if showInvalidBagde === true} -->
      <ModalConfirmation on:message={closePop} title={modalMessage} />

      <!-- <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Campo supervisor está vazio</h5>
          <p autofocus tabindex="26" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div> -->
    {/if}

    {#if modalMessage === "Crachá inválido"}
      <ModalConfirmation on:message={closePopCor} title={modalMessage} />
      <!-- {#if showInvalidBagde === true} -->
      <!-- <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Cracha invalido</h5>
          <p
            autofocus
            tabindex="26"
            on:keypress={closePopCor}
            on:click={closePopCor}
          >
            Fechar
          </p>
        </div>
      </div> -->

      <!-- <div class="modalBackground">
        <div class="confirmationModal">
          <div class="onlyConfirmModalContent">
            <h2 class="modalTitle">Cracha invalido</h2>
            <button
              autofocus
              tabindex="26"
              on:keypress={closePopCor}
              on:input={blockForbiddenChars}
              class="btnPop"
              type="text">FECHAR</button
            >
          </div>
        </div>
      </div> -->
    {/if}

    {#if showBarcode === true}
      <div class="form">
        <div id="popUpCracha">
          <div id="title">CÓDIGO DE BARRAS DA ODF</div>
          <input
            autocomplete="off"
            autofocus
            on:keypress={writeOnHand}
            on:input|preventDefault={blockForbiddenChars}
            bind:value={codigoBarras}
            onkeyup="this.value = this.value.toUpperCase()"
            name="MATRIC"
            id="MATRIC"
            type="text"
          />
        </div>
      </div>
    {/if}

    {#if showBadge === true}
      <div class="form">
        <div id="popUpCracha">
          <div id="title">COLABORADOR</div>
          <input
            autocomplete="off"
            autofocus
            on:keypress={checkBeforeBadge}
            on:input|preventDefault={blockForbiddenChars}
            bind:value={cracha}
            onkeyup="this.value = this.value.toUpperCase()"
            name="MATRIC"
            id="MATRIC"
            type="text"
          />
        </div>
      </div>
    {/if}
  </div>
  {#if showmodal === true}
    <div class="fundo">
      <div class="header">
        <div class="close">
          <h4>Codigo do Supervisor</h4>
        </div>
        <input
        autocomplete='off'
          autofocus
          tabindex="14"
          bind:value={supervisor}
          class="returnInput"
          on:input={blockForbiddenChars}
          onkeyup="this.value = this.value.toUpperCase()"
          type="text"
          name="supervisor"
          id="supervisor"
        />
        <h4>Qual irá retornar</h4>
        <div class="options">
          <select
            tabindex="15"
            bind:value={returnValueStorage}
            name="id"
            id="id"
          >
            <option>BOAS</option>
            <option>RUINS</option>
            <!-- <option>PARCIAL</option>
              <option>FALTANTE</option> -->
          </select>
        </div>
        <h4>Insira a quantidade que deseja estornar</h4>
        <input
          tabindex="15"
          on:input={blockForbiddenChars}
          autocomplete="off"
          class="returnInput"
          onkeyup="this.value = this.value.toUpperCase()"
          bind:value={quantity}
          type="text"
          name="returnValueStorage"
        />

        <h4>CÓDIGO DE BARRAS DA ODF</h4>
        <input
          tabindex="16"
          on:input={blockForbiddenChars}
          autocomplete="off"
          class="returnInput"
          onkeyup="this.value = this.value.toUpperCase()"
          bind:value={codigoBarrasReturn}
          id="codigoBarras"
          name="codigoBarras"
          type="text"
        />

        <div>
          <p
            tabindex="17"
            on:keypress|preventDefault={doReturn}
            on:click|preventDefault={doReturn}
          >
            Confirmar
          </p>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .modalBackground {
        transition: 1s;
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
        z-index: 999999999999999999999999999999;
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
  }

  button {
    letter-spacing: 0.5px;
    width: fit-content;
    height: 28px;
    border: none;
    color: white;
    background-color: transparent;
  }
  /* .loader {
    margin: 0%;
    position: relative;
    width: 10vw;
    height: 5vw;
    padding: 1.5vw;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999999999;
  } */
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
    z-index: 999999999999;
  }
  div {
    margin: 0%;
    padding: 0%;
  }
  input {
    margin: 1%;
    padding: 0%;
    border-radius: 3px;
  }
  h4 {
    width: 400px;
    margin: 0%;
    padding: 0%;
  }
  .close {
    margin: 0%;
    padding: 0%;
    width: 400px;
    display: flex;
  }
  select {
    margin: 1%;
    padding: 0%;
    width: 150px;
    border-radius: 3px;
    color: #fff;
    background-color: #252525;
  }
  .returnInput {
    height: 30px;
    width: 100px;
  }
  p {
    margin: 0%;
    padding: 0%;
    display: flex;
    justify-content: center;
    text-decoration: none;
    background: #252525;
    color: #fff;
  }
  .form {
    height: 180px;
    letter-spacing: 1px;
    border-color: grey;
    box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
  }
   .fundo {
    margin: 0%;
    padding: 0%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #252525;
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

  .sideButton {
    background-color: black;
    color: black;
    margin: 1%;
    padding: 0%;
    font-size: 14px;
    width: 132px;
    height: 35px;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    border-radius: 3px;
    background-color: transparent;
    border-radius: 4px;
  }

  .sideButton:hover {
    cursor: pointer;
    background-color: black;
    color: white;
    transition: 1s;
  }

  #MATRIC {
    margin: 1%;
  }

  h5 {
    font-size: 45px;
  }


  main {
    margin: 1%;
  }

  #popUpCracha {
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
  input{
    border-radius: 8px;
  }

  .confirmationModal {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 550px;
        height: 250px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
    }
</style>
