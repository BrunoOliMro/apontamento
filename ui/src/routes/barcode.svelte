<script>
  import { bind } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Title from "../components/title/title.svelte";
  let value = "";
  let codigoBarras = "";
  let urlS = `/api/v1/apontamento`;
  let urlBagde = `/api/v1/apontamentoCracha`;
  let cracha = "";
  let showmodal = false;
  let returnedValueApi = `/api/v1/returnedValue`;
  let returnValueStorage;
  let superCracha;

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
  /**
   * @param {string} input
   */
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
      body: JSON.stringify({
        codigoBarras: !codigoBarras ? "" : codigoBarras,
      }),
      headers,
    });
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
    console.log(res);
  };

  function red() {
    if (barcodeMsg === "red") {
      window.location.href = "/#/ferramenta";
    }
  }
  let s = red();

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
  function closePopConfir() {
    if (showmodal === false) {
      showmodal = true;
    } else {
      showmodal = false;
    }
  }
  async function doReturn() {
    const res = await fetch(returnedValueApi, {
      method: "POST",
      body: JSON.stringify({
        returnValueStorage: returnValueStorage,
        superCracha: superCracha,
      }),
    });
  }
</script>

<main>
  <div>
    <div>
      <Title />
      <div class="return">
        <button on:click={returnValue} class="sideButton">
          Estornar Valores
        </button>
      </div>
    </div>

    {#if barcodeMsg === "anotherodfexpected"}
      <div class="fundo">
        <div class="invalidBarcode" id="s">
          <h5>Outra Odf Esperada</h5>
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
    {#if showmodal === true}
      <div class="fundo">
        <form action="/api/v1/returnedValue" method="POST" on:submit={doReturn}>
          <div class="header">
            <p>Codigo do Supervisor</p>
            <input
              on:input={blockForbiddenChars}
              onkeyup="this.value = this.value.toUpperCase()"
              bind:value
              type="text"
              name="superCracha"
            />
            <p>Insira a quantidade que deseja estornar</p>
            <input
              onkeyup="this.value = this.value.toUpperCase()"
              bind:value
              type="text"
              name="returnValueStorage"
            />
            <p>Qual irá retornar</p>
            <p>BOAS</p>
            <p>RUINS</p>
            <p>PARCIAL</p>
            <p>FALTANTE</p>
            <div>
              <p on:click={doReturn} type="submit">
                Confirma Devolução de Estoque?
              </p>
            </div>
            <div class="close">
              <p on:click={closePopConfir}>Fechar</p>
            </div>
          </div>
        </form>
      </div>
    {/if}
  </div>
</main>

<style>
  .fundo {
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
  }
  .header {
    font-size: 10px;
    color: white;
    background-color: black;
    width: 500px;
    height: 300px;
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
    letter-spacing: 1px;
    border-color: grey;
    box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
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
  .fundo {
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
  }
  p {
    font-size: 35px;
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
    padding: 15px;
    font-size: 35px;
    border-radius: 5px;
    color: black;
    justify-content: center;
    text-align: center;
    align-items: center;
  }
</style>
