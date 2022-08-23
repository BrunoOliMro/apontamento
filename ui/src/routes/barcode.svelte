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
    document.getElementById("popUp").style.display = "block";
  }

  function popUpCracha() {
    document.getElementById("popUpCracha").style.display = "block";
  }

  function handleSubmit() {
    result = doPost();
  }

  function getSubmit(e) {

    if (e.key === "Enter") {
      document.getElementById("popUp").style.display = "block";
      document.getElementById("popUpCracha").style.display = "block";
      handleSubmit();
    } else if (e.key === popUp ) {
      document.getElementById("popUp").style.display = "none";
      document.getElementById("popUpCracha").style.display = "none";
    }
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

  //local Storage Front
  function setValues() {
    var values = value;
    localStorage.setItem("barcodeData", values);
  }
</script>

<svelte:window on:keydown={getSubmit} />
<main>
  <div>
    <Breadcrumb />
    <Title />

    <div class="bar">Código de barras</div>
    <form action="/api/v1/apontamento" method="POST" on:submit={handleSubmit}>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="input">
        <div id="popUp">
          <div id="button" on:click={popUp}>X</div>
          <div>Codigo de barras Invalido</div>
        </div>

        <div id="popUpCracha">
          <div id="button" on:click={popUpCracha}>X</div>
          <div>Selecione quem irá produzir essa peça</div>
          <input id="inputText" type="text" />
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
    <!-- 
      
    </form> -->
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
    display: none;
    position: absolute;
    background-color: black;
    color: white;
  }

  #popUp {
    padding: 20px;
    font-size: 35px;
    border-radius: 5px;
    display: none;
    position: absolute;
    background-color: black;
    color: white;
  }
</style>
