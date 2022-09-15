<script>
  import { bind } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Title from "../components/title/title.svelte";
  let value = "";
  let codigoBarras = "";
  let result = {};
  let urlS = `/api/v1/apontamento`;
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

  const doPost = async (/** @type {any} */ error, /** @type {Response} */ res) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    res = await fetch(urlS, {
      method: "POST",
      body: JSON.stringify({
        codigoBarras: !codigoBarras ? "" : codigoBarras,
      }),
      headers,
    });
    if (!res.ok) {
      alert(res.status)
    } else {
      alert(res.status);
    }
  };

  // data = await res.json();
  let resultado = doPost;
</script>

<main>
  <div>
    <Title />

    <!-- {#if !data.ok}
    <div> dheb</div>
    {/if} -->

    <!-- {#await resultado }
  <div>...</div>
{:then da }  -->
    <div
      class="modal fade show"
      id="exampleModalCenter"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle"
      aria-hidden="true"
    >
      <div>
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLongTitle">
                Codigo de barras Invalido
              </h5>
            </div>
            <div class="modal-body">
              <p>Codigo de barras não encontrado ou não é valido</p>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal">Fechar</button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- {/await} -->

    <div class="bar" id="title">Código de barras</div>
    <!-- on:input={setValues} -->
    <!-- on:input={blockForbiddenChars} -->
    <form action="/api/v1/apontamento" method="POST" on:submit={doPost}>
      <label class="input">
        <input bind:value id="codigoBarras" name="codigoBarras" type="text" />
      </label>
    </form>

    <form action="/api/v1/apontamentoCracha" method="POST">
      <div id="popUpCracha">
        <!-- on:input={blockForbiddenChars} -->
        <div id="title">Colaborador</div>
        <input name="MATRIC" id="MATRIC" type="text" />
      </div>
    </form>
    <!-- <button
    type="button"
    class="btn btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#exampleModalCenter"
  >
    Codigo de barras Invalido
  </button> -->
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
