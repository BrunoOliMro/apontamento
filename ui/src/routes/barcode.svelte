<script>
  import { bind } from "svelte/internal";
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  import Title from "../components/title/title.svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let value = "";
  let codigoBarras = "";
  let result = {};
  let urlS = `/api/v1/apontamento`;

  // function handleSubmit() {
  //   result = doPost();
  // }

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

  // function setValues() {
  //   var values = value;
  //   localStorage.setItem("barcodeData", values);
  // }

  // async function doPost() {
    // value = preSanitize(value);
    // if (value.length < 16) {
    //   alert("INVALIDO");
    // }
  //   alert("ODF INVALIDA");

  //     const res = await fetch(urlS, {
  //       method: "POST",
  //       body: JSON.stringify({
  //         codigoBarras: !codigoBarras ? "" : codigoBarras,
  //       }),
  //     });
  //     const data = await res.json();
  //     // .then((res) => {
  //     //   if (res.length === 1) {
  //     //   }
  //     // });
  // }

    async function doPost() {
        const res = await fetch(urlS, {
        method: "POST",
        body: JSON.stringify({codigoBarras: !codigoBarras ? "" : codigoBarras})});
        const odfData = await res.json();
    }
</script>

<main>
  <div>
    <Breadcrumb />
    <Title />
    <div class="bar" id="title">Código de barras</div>
    <!-- on:input={setValues} -->
    <form action="/api/v1/apontamento" method="POST" on:submit={doPost}>
      <label class="input">
        <input
          bind:value
          on:input={blockForbiddenChars}
          id="codigoBarras"
          name="codigoBarras"
          type="text"
        />
      </label>
    </form>

    <form action="/api/v1/apontamentoCracha" method="POST">
      <div id="popUpCracha">
        <div id="title">Colaborador</div>
        <input
          on:input={blockForbiddenChars}
          name="MATRIC"
          id="MATRIC"
          type="text"
        />
      </div>
    </form>
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
