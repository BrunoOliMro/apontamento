<script>
  import { bind } from "svelte/internal";
  import Title from "../components/title/title.svelte";
  let value;
  let codigoBarras = "";
  let urlS = `/api/v1/apontamento`;
  let urlBagde = `/api/v1/apontamentoCracha`;
  let cracha = "";
  let showmodal = false;
  let showCorr = false;
  let returnedValueApi = `/api/v1/returnedValue`;
  let returnValueStorage;
  let supervisor;
  let quantity;
  let showApontInic = false

  let barcodeMsg = "";
  if (window.location.href.includes("?")) {
    barcodeMsg = window.location.href.split("?")[1].split("=")[1];
  }

  let badgeMsg = "";
  if (window.location.href.includes("?")) {
    badgeMsg = window.location.href.split("?")[1].split("=")[1];
  }

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigoBarras: !codigoBarras ? "" : codigoBarras,
      }),
    });
    // if (barcodeMsg === "red") {
    //   showApontInic = true
    // }
    console.log('barcodeMsg:   ',barcodeMsg);
    if (barcodeMsg === "red") {
      window.location.href = "/#/ferramenta";
    }
  };

  const checkBagde = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch(urlBagde, {
      method: "POST",
      body: JSON.stringify({
        cracha: !cracha ? "" : cracha,
      }),
      headers,
    });
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
      }),
    });
    if (res.ok) {
      showmodal = false;
      showCorr = true;
      window.location.href = "/#/codigobarras";
    }
  }

  function closePopCor() {
    showCorr = false;
  }
</script>

<main>
  <div>
    <div>
      <Title />
      {#if barcodeMsg === "ok"}
        <div class="return">
          <button on:click={returnValue} class="sideButton">
            Estornar Valores
          </button>
        </div>
      {/if}
    </div>

    {#if showCorr === true}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Estorno Feito</h5>
          <p on:click={closePopCor}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === "anotherodfexpected"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Outra Odf Esperada</h5>
          <p on:click={closePop}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === "odflimitquantity"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>ODF JA APONTOU TODA QUANTIDADE</h5>
          <p on:click={closePop}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === "nolimitonlastodf"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>ODF PASSADA ESTA COM 0 APONTADA</h5>
          <p on:click={closePop}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === "invalidBarcode"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Codigo de barras Invalido</h5>
          <p on:click={closePop}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if badgeMsg === "invalidBadge"}
      <div class="fundo">
        <div class="invalidBadge" id="s">
          <h5>Crachá Invalido</h5>
          <p on:click={closePop}>Fechar</p>
        </div>
      </div>
    {/if}

    {#if barcodeMsg === "ok" || barcodeMsg === "invalidBarcode"}
      <form action="/api/v1/apontamento" method="POST" on:submit={doPost}>
        <div class="form">
          <div class="bar" id="title">Código de barras</div>
          <!-- on:input={setValues} -->
          <label class="input">
            <input
              on:input={blockForbiddenChars}
              onkeyup="this.value = this.value.toUpperCase()"
              bind:value
              id="codigoBarras"
              name="codigoBarras"
              type="text"
            />
          </label>
        </div>
      </form>
    {/if}

    {#if badgeMsg === "" || badgeMsg === "invalidBadge"}
      <form
        action="/api/v1/apontamentoCracha"
        method="POST"
        on:submit={checkBagde}
      >
        <div id="popUpCracha">
          <div id="title">Colaborador</div>
          <input
            on:input={blockForbiddenChars}
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
    <form action="/api/v1/returnedValue" method="POST" on:submit={doReturn}>
      <div class="fundo">
        <div class="header">
          <div class="close">
            <h4>Codigo do Supervisor</h4>
          </div>
          <input
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
            <select bind:value={returnValueStorage} name="id" id="id">
              <option>BOAS</option>
              <option>RUINS</option>
              <option>PARCIAL</option>
              <option>FALTANTE</option>
            </select>
          </div>
          <h4>Insira a quantidade que deseja estornar</h4>
          <input
            on:input={blockForbiddenChars}
            class="returnInput"
            onkeyup="this.value = this.value.toUpperCase()"
            bind:value={quantity}
            type="text"
            name="returnValueStorage"
          />

          <h4>Codigo de Barras da Odf</h4>
          <input
            on:input={blockForbiddenChars}
            class="returnInput"
            onkeyup="this.value = this.value.toUpperCase()"
            bind:value={quantity}
            type="text"
            name="returnValueStorage"
          />

          <div>
            <p on:click={doReturn} type="submit">Confirmar</p>
          </div>
        </div>
      </div>
    </form>
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
