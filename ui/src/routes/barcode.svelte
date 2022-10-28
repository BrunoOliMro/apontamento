<script>
  // @ts-nocheck
  import { bind, get_slot_changes } from "svelte/internal";
  import Title from "../components/title/title.svelte";
  let value;
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
  let showError = false;
  let showBadgeNotFound = false;
  let bagdeEmpty = false;
  let showBadge = true;
  let showBarcode = false;
  let showSupervisor = false;
  let quantityModal = false;
  let errorReturnValue = false;
  let returnValueAvailable;
  let paradaMsg = ''
  let barcodeMsg = "";
  let breadCrumbmodal = ''
  // if (window.location.href.includes("?")) {
  //   barcodeMsg = window.location.href.split("?")[1].split("=")[1];
  // }

  let badgeMsg = "";
  if (window.location.href.includes("?")) {
    badgeMsg = window.location.href.split("?")[1].split("=")[1];
  }

  // if (window.location.href.includes("?")) {
  //   superParada = window.location.href.split("?")[1].split("=")[1];
  // }

  const doPostSuper = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch(supervisorApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        superSuperMaqPar: !superSuperMaqPar ? "" : superSuperMaqPar,
      }),
    }).then((res) => res.json());
    console.log("linha 54", res);
    if (res.message === "maquina") {
      window.location.href = "/#/codigobarras";
      location.reload();
    }
    if (res.message === "supervisor não encontrado") {
      superParada = false;
      paradaMsg = 'supervisor não encontrado'
      showmodal = false;
    }

    if (res.message === "erro na parada de maquina") {
      showmodal = false;
      superParada = false;
      paradaMsg = 'erro na parada de maquina'
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
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch(urlS, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        codigoBarras: !codigoBarras ? "" : codigoBarras,
      }),
    }).then((res) => res.json());
    if (res.message === "codigo de barras vazio") {
      barcodeMsg = "codigo de barras vazio";
    }
    if (res.message === "odf não encontrada") {
      barcodeMsg = "odf não encontrada";
    }
    if (res.message === "não há limite na odf") {
      barcodeMsg = "não há limite na odf";
    }
    if (res.message === "paradademaquina") {
      superParada = true;
    }
    if (res.message === "paradademaquina") {
      breadCrumbmodal = true;
    }
    if (res.message === "feito") {
      window.location.href = "/#/ferramenta";
      //location.reload();
    }
  };

  const checkBagde = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch(urlBagde, {
      method: "POST",
      body: JSON.stringify({
        cracha,
      }),
      headers,
    }).then((res) => res.json());
    if (res.message === "cracha não encontrado") {
      showBadgeNotFound = true;
    }
    if (res.message === "codigo de matricula vazia") {
      bagdeEmpty = true;
    }
    if (res.message === "cracha encontrado") {
      showBarcode = true;
      showBadge = false;
    }
  };

  function closePop() {
    document.getElementById("s").style.display = "none";
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
    console.log("linha 143", res);
    if (res.message === "supervisor esta vazio") {
      showSupervisor = true;
      showmodal = false;
      //location.reload();
    }
    if (res.message === "estorno feito") {
      showmodal = false;
      showCorr = true;
      window.location.href = "/#/codigobarras";
      //location.reload();
    }
    if (res.message === "erro de estorno") {
      errorReturnValue = true;
      showmodal = false;
      //location.reload();
    }
    if (res.message === "quantidade esta vazio") {
      quantityModal = true;
      showmodal = false;
      //location.reload();
    }
    if (res.message === "codigo de barras vazio") {
      barcodeMsg = "codigo de barras vazio";
      showmodal = false;
    }
    // if (res.message === "odf não encontrada") {
    //   barcodeMsg = "odf não encontrada";
    //   showmodal = false;
    // }
    if (res.message === "odf não encontrada") {
      barcodeMsg = "odf não encontrada";
      showmodal = false;
    }
    if (res.message === "não ha valor que possa ser devolvido") {
      barcodeMsg = "não ha valor que possa ser devolvido";
      showmodal = false;
    }
    if (res.String === "valor devolvido maior que o permitido") {
      barcodeMsg = "valor devolvido maior que o permitido";
      returnValueAvailable = res.qtdLibMax
      showmodal = false;
    }
  }

  function closePopCor() {
    barcodeMsg = "";
    paradaMsg = ''
    errorReturnValue = false;
    showSupervisor = false;
    quantityModal = false;
    showCorr = false;
    showmodal = false;
    location.reload();
  }
</script>

<main>
  <!-- {#if }
    
  {/if} -->
  <nav class="breadcrumb" aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <a href="/#/codigobarras">Colaborador</a>
      </li>
    </ol>
  </nav>
  <div>
    <div>
      <Title />
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
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Maquina Parada selecione um supervisor</h5>
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

    {#if showCorr === true}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Estorno Feito</h5>
          <p autofocus  tabindex="30" on:keypress={closePopCor} on:click={closePopCor}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if errorReturnValue === true}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Erro ao fazer estorno</h5>
          <p autofocus tabindex="31"  on:keypress={closePopCor} on:click={closePopCor}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === 'não ha valor que possa ser devolvido'}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Não há limite para Estorno</h5>
          <p autofocus  tabindex="32"  on:keypress={closePopCor} on:click={closePopCor}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if paradaMsg === 'supervisor não encontrado'}
    <div class="fundo">
      <div class="invalidBarcode" id="s">
        <h5>Supervisor não encontrado</h5>
        <p autofocus tabindex="33"  on:keypress={closePopCor} on:click={closePopCor}>Fechar</p>
      </div>
    </div>
  {/if}

    {#if barcodeMsg === "valor devolvido maior que o permitido"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Limite de estorno menor que o apontado</h5>
          <h3>Limite Disponivel: {returnValueAvailable}</h3>
          <p autofocus tabindex="34"  on:keypress={closePopCor} on:click={closePopCor}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === "não há limite na odf"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>ODF não pode ser apontada, aponte outra</h5>
          <p autofocus tabindex="35" on:keypress={closePop} on:click={closePop}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === "odf não encontrada"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>ODF não encontrada</h5>
          <p autofocus tabindex="23" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === "codigo de barras vazio"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Codigo de barras vazio</h5>
          <p autofocus tabindex="24" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div>
    {/if}

    {#if showBadgeNotFound === true}
      <!-- {#if showInvalidBagde === true} -->
      <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Crachá não encontrado</h5>
          <p autofocus tabindex="25" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div>
    {/if}

    {#if bagdeEmpty === true}
      <!-- {#if showInvalidBagde === true} -->
      <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Crachá vazio</h5>
          <p autofocus tabindex="26" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div>
    {/if}

    {#if quantityModal === true}
      <!-- {#if showInvalidBagde === true} -->
      <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Quantidade indefinida</h5>
          <p autofocus tabindex="26" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div>
    {/if}

    {#if showSupervisor === true}
      <!-- {#if showInvalidBagde === true} -->
      <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Campo supervisor está vazio</h5>
          <p autofocus tabindex="26" on:keypress={closePop} on:click={closePop}>
            Fechar
          </p>
        </div>
      </div>
    {/if}

    {#if showBarcode === true}
      <form
        action="/api/v1/apontamento"
        method="POST"
        on:submit|preventDefault={doPost}
      >
        <div class="form">
          <div class="bar" id="title">Código de barras da ODF</div>
          <label class="input">
            <!-- autocomplete="off" -->
            <input
              autofocus
              on:input={blockForbiddenChars}
              onkeyup="this.value = this.value.toUpperCase()"
              bind:value={codigoBarras}
              id="codigoBarras"
              name="codigoBarras"
              type="text"
            />
          </label>
        </div>
      </form>
    {/if}

    {#if showBadge === true}
      <form on:submit|preventDefault={checkBagde}>
        <!-- on:keypress={checkBagde} -->
        <div id="popUpCracha">
          <div id="title">Colaborador</div>
          <!-- autocomplete="off" -->
          <input
            autofocus
            on:input={blockForbiddenChars}
            bind:value={cracha}
            onkeyup="this.value = this.value.toUpperCase()"
            name="MATRIC"
            id="MATRIC"
            type="text"
          />
        </div>
      </form>
    {/if}
  </div>
  {#if showmodal === true}
    <div class="fundo">
      <div class="header">
        <div class="close">
          <h4>Codigo do Supervisor</h4>
        </div>
        <!-- autocomplete="off" -->
        <input
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
          class="returnInput"
          onkeyup="this.value = this.value.toUpperCase()"
          bind:value={quantity}
          type="text"
          name="returnValueStorage"
        />

        <h4>Codigo de barras da ODF</h4>
        <input
          tabindex="16"
          on:input={blockForbiddenChars}
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
    background-color: rgba(17, 17, 17, 0.618);
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    z-index: 8;
  }
  .header {
    margin: 0%;
    padding: 0%;
    color: white;
    background-color: #252525;
    width: 450px;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 3px;
    z-index: 9;
  }
  .return {
    display: flex;
    justify-content: flex-end;
    text-align: center;
    align-items: center;
  }
  .sideButton {
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
  .invalidBadge {
    color: white;
    background-color: black;
    width: 500px;
    height: 250px;
    /* position: absolute;
        top: 20%;
        left: 40%; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 3px;
  }
  .invalidBarcode {
    color: white;
    background-color: black;
    width: 500px;
    height: 250px;
    /* position: absolute;
    top: 20%;
    left: 40%; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 3px;
  }
  main {
    margin: 1%;
  }
  .bar {
    font-size: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 1%;
  }
  .input {
    font-size: 35px;
    justify-content: center;
    align-items: center;
    text-align: center;
    display: flex;
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
  form {
    border-radius: 3px;
    height: 180px;
    letter-spacing: 1px;
    border-color: grey;
    box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
  }
</style>
