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
  };

  let resultado = doPost;
</script>

<main>
  <div>
    <Title />
    {#if barcodeMsg === "invalidBarcode"}
      <h5 class="invalidBarcode">Codigo de barras Invalido</h5>
    {/if}

    {#if badgeMsg === "invalidBadge"}
      <h5 class="invalidBadge">Crachá Invalido</h5>
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
  .invalidBadge {
    font-size: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .invalidBarcode {
    font-size: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
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
