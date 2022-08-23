<script>
  import { bind } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Title from "../components/title/title.svelte";

  let value = "";
  let codigoBarras = "";
  let result = {};
  let MATRIC = "";

  async function doPost() {
    codigoBarras = preSanitize(codigoBarras);
    if (codigoBarras.length < 16) {
      codigoBarras = "";
    } else {
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


  function handleSubmit() {
    result = doPost();
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

  function setNomeCracha() {
    var MATRIC = MATRIC;
    localStorage.setItem("MATRIC", MATRIC);
  }
</script>

<main>
  <div>
    <Breadcrumb />
    <Title />

    <div class="bar">Código de barras</div>

    <div id="popUp">
      <div id="button">X</div>
      <div>Codigo de barras Invalido</div>
    </div>

    <div id="popUp">
      <div id="button">X</div>
      <div>Usuario Invalido</div>
    </div>
    
    
    <form action="/api/v1/apontamentoCracha" method="POST">
    <div id="popUpCracha">
      <div id="button">X</div>
      <div>Selecione quem irá produzir essa peça</div>
      <input
        on:input={blockForbiddenChars}
        on:input={setNomeCracha}
        name="MATRIC"
        id="MATRIC"
        type="text"
      />
    </div>
  </form>

    <form action="/api/v1/apontamento" method="POST" 
    on:submit={handleSubmit}>
      <label class="input">
        <input
          bind:value
          on:input={blockForbiddenChars}
          on:input={setValues}
          id="codigoBarras"
          name="codigoBarras"
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
    background-color: black;
    color: white;
  }

  #popUp {
    padding: 20px;
    font-size: 35px;
    border-radius: 5px;
    background-color: black;
    color: white;
  }
</style>
