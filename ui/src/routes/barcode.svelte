<script>
  import { bind } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Title from "../components/title/title.svelte";

  let value = "";
  let codigoBarras;
  let result = {};

  async function doPost() {
    codigoBarras = preSanitize(codigoBarras);

    if (codigoBarras.length < 16) {
      alert("Valor inválido.");
      codigoBarras = "";
    } else {
      

      const res = await fetch(`/api/v1/apontamento`, {
        method: "POST",
        body: JSON.stringify({
          codigoBarras: !codigoBarras ? "" : codigoBarras,
        }),
        headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
      })
        .then((res) => res.json())
        .then(console.log);
    }
  }

  function handleSubmit() {
    result = doPost();
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
  
  function setValues() {
    var values = value;
    localStorage.setItem("barcodeData", values);
  }
</script>

<main>
  <div>
    <Breadcrumb />
    <Title />

    <div class="bar">Código de barras</div>
    <!-- <form on:submit|preventDefault={handleSubmit} > -->
    <form action="/api/v1/apontamento" method="POST">
      <label class="input">
        <input
          bind:value
          on:input={blockForbiddenChars}
          on:input={setValues}
          on:keyup={handleSubmit}

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
</style>
