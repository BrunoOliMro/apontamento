<script>
  import { bind } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Title from "../components/title/title.svelte";

  let value = "";
  let codigoBarras = "";
  let result = {};
  let urlS = `/api/v1/apontamento`;

  async function doPost() {
    const res = await fetch(urlS, {
      method: "POST",
      body: JSON.stringify({ codigoBarras: !codigoBarras ? "" : codigoBarras }),
    });
    const data = await res.json().then(json =>{
      return Promise.resolve({json: json, res: Response})
    });
    console.log(data[0])
  }

  // codigoBarras = preSanitize(codigoBarras);

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

  function mymm() {
    let xx = document.getElementById("popUp");
    xx.style.display = "block";
  }

  function myFunction(e) {
    var x = document.getElementById("popUp");
    x.style.display = "none";
  }

  // function mken(e){
  //   if(x === "none"){
  //     var x = document.getElementById('popUp').style.display = "block";
  //   }
  // }
</script>

<main>
  <div>
    <Breadcrumb />
    <Title />

    <div class="bar">Código de barras</div>
    <form action="/api/v1/apontamento" method="POST" on:submit={handleSubmit}>
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

    {#if doPost.length > 0}
      <div id="popUp">
        <div id="button">X</div>
        <div>Codigo de barras Invalido</div>
      </div>
    {/if}

    <!-- <div id="popUp">
      <div id="button">X</div>
      <div>Usuario Invalido</div>
    </div> -->

    <form action="/api/v1/apontamentoCracha" method="POST">
      <div id="popUpCracha">
        <div>Colaborador</div>
        <input
          on:input={blockForbiddenChars}
          name="MATRIC"
          id="MATRIC"
          type="text"
        />
      </div>
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
    color: black;
    justify-content: center;
    text-align: center;
    align-items: center;
  }

  #popUp {
    padding: 20px;
    font-size: 35px;
    display: none;
    border-radius: 5px;
    color: black;
  }
</style>
