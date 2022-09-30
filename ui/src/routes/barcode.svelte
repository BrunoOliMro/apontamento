<script>
  import { bind } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Title from "../components/title/title.svelte";
  let value = "";
  let codigoBarras = "";
  let result = {};
  let urlS = `/api/v1/apontamento`;
  let urlBagde = `/api/v1/apontamentoCracha`;
  let cracha = "";

  let barcodeMsg = "";
  if (window.location.href.includes("?")) {
    barcodeMsg = window.location.href.split("?")[1].split("=")[1];
  }

  let badgeMsg = "";
  if (window.location.href.includes("?")) {
    badgeMsg = window.location.href.split("?")[1].split("=")[1];
  }

  // function handleSubmit() {
  //   result = doPost();
  // }

  // function blockForbiddenChars(e) {
  //   let value = e.target.value;
  //   e.target.value = preSanitize(value);
  // }

  // /**
  //  * @param {string} input
  //  */
  // function preSanitize(input) {
  //   const allowedChars = /[A-Za-z0-9]/;
  //   const sanitizedOutput = input
  //     .split("")
  //     .map((char) => (allowedChars.test(char) ? char : ""))
  //     .join("");
  //   return sanitizedOutput;
  // }

  // function setValues() {
  //   var values = value;
  //   localStorage.setItem("barcodeData", values);
  // }

  // async function doPost() {
  // value = preSanitize(value);

  const doPost = async (
    /** @type {any} */ error,
    /** @type {Response} */ res
  ) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    res = await fetch(urlS, {
      method: "POST",
      body: JSON.stringify({
        codigoBarras: !codigoBarras ? "" : codigoBarras,
      }),
      headers,
    });
  };

  const checkBagde = async (
    /** @type {any} */ error,
    /** @type {Response} */ res
  ) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    res = await fetch(urlBagde, {
      method: "POST",
      body: JSON.stringify({
        cracha: !cracha ? "" : cracha,
      }),
      headers,
    });
    console.log(res)
  };

  let resultado = doPost;

  function red (){
    if(barcodeMsg === "red") {
      window.location.href = "/#/ferramenta";
    }
  }
  let s = red()

  function closePop() {
    document.getElementById("s").style.display = "none";
    window.location.href = "/#/codigobarras";
    location.reload()
  }
</script>

<main>
  <div>
    <Title />
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
        <!-- on:input={blockForbiddenChars} -->
        <label class="input">
          <input bind:value id="codigoBarras" name="codigoBarras" type="text" />
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
          <!-- on:input={blockForbiddenChars} -->
          <div id="title">Colaborador</div>
          <input name="MATRIC" id="MATRIC" type="text" />
        </div>
      </form>
    {/if}
  </div>
</main>

<style>
  #MATRIC{
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
