<script>
  import { bind } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Title from "../components/title/title.svelte";

  let value = "";
  let codigoBarras = "";
  let result = {};

  async function doPost() {
    codigoBarras = preSanitize(codigoBarras);
    if (codigoBarras.length < 16) {
      popUp();
      codigoBarras = "";
    } else {
      popUpCracha();
      const res = await fetch(`/api/v1/apontamento`, {
        method: "POST",
        body: JSON.stringify({
          codigoBarras: !codigoBarras ? "" : codigoBarras,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }).then((res) => res.json());
    }
  }

  function popUp() {
    const closePop = (document.getElementById("popUp").style.display = "none");
  }

  function popUpCracha() {
    const cracha = (document.getElementById("popUpCracha").style.display =
      "none");
  }

  function handleSubmit(event) {
    result = doPost();
  }

  function getSubmit(event) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  }

  function blockForbiddenChars(event) {
    let value = event.target.value;
    event.target.value = preSanitize(value);
  }

  function preSanitize(input) {
    const allowedChars = /[A-Za-z0-9]/;
    const sanitizedOutput = input
      .split("")
      .map((char) => (allowedChars.test(char) ? char : ""))
      .join("");
    return sanitizedOutput;
  }

  //local Storage Front
  function setValues() {
    var values = value;
    localStorage.setItem("barcodeData", values);
  }
</script>

<svelte:window on:keyup={getSubmit} />
<main>
  <div>
    <Breadcrumb />
    <Title />

    <div class="bar">Código de barras</div>
    <!-- <form on:submit|preventDefault={handleSubmit} > -->
    <form action="/api/v1/apontamento" method="POST" on:submit={handleSubmit}>
      <label class="input">
        <div class="modal_body">
          <div id="popUp">
            <div id="button" on:click={popUp}>X</div>
            <div>Codigo de barras Invalido</div>
          </div>

          <div id="popUpCracha">
            <div id="button" on:click={popUpCracha}>X</div>
            <div>Selecione quem irá produzir essa peça</div>
            <input id="inputText" type="text" />
          </div>
        </div>

        <input
          bind:value
          on:input={blockForbiddenChars}
          on:input={setValues}
          id="codigoBarras"
          name="codigoBarras"
          minlength="16"
          maxlength="18"
          type="text"
        />
      </label>
    </form>
  </div>
</main>

<style>
  main {
    margin: 1%;
  }
  .bar {
    font-size: 35px;
    display: flex;
    justify-content: center;
    margin: 1%;
  }
  .input {
    font-size: 35px;
    justify-content: center;
    align-items: center;
    text-align: center;
    display: flex;
  }

  #inputText {
    background-color: black;
    color: white;
  }

  #button {
    display: flex;
    justify-content: right;
    align-items: center;
    text-align: center;
  }

  #popUpCracha {
    padding: 15px;
    font-size: 35px;
    border-radius: 5px;
    display: block;
    position: absolute;
    background-color: black;
    color: white;
  }

  #popUp {
    padding: 20px;
    font-size: 35px;
    border-radius: 5px;
    display: block;
    position: absolute;
    background-color: black;
    color: white;
  }
</style>
