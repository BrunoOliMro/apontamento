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
    const data = await res.json().then((json) => {
      return Promise.resolve({ json: json, res: Response });
    });
    console.log(data[0]);
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
</script>

<main>
  <div>
    <Breadcrumb />
    <Title />

    <div class="bar" id="title">Código de barras</div>
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
  </div>

  <!-- <button
    type="button"
    class="btn btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#exampleModalCenter"
  >
    Codigo de barras Invalido
  </button> -->

  <!-- {#await result.ok}
    <div>...</div>
  {:then result.ok} 
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
{/await} -->

  {#if result.ok}
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
  {/if}
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

  @media (max-width: 820px) {
    input {
      width: 150px;
    }
    #title {
      font-size: 20px;
    }
  }

  @media (max-width: 1200px) {
    input {
      width: 150px;
    }
    #title {
      font-size: 20px;
    }
  }

  @media screen and (max-width: 550px) {
    input {
      width: 170px;
    }
    #title {
      margin-top: 5%;
      font-size: 20px;
    }
  }

  @media screen and (min-width: 551px) {
    input {
      width: 190px;
    }
    #title {
      margin-top: 5%;
      font-size: 25px;
    }
  }

  @media screen and (min-width: 860px) {
    input {
      width: 240px;
    }
    #title {
      margin-top: 5%;
      font-size: 25px;
    }
  }
  @media screen and (min-width: 1000px) {
    input {
      width: 250px;
    }
    #title {
      margin-top: 5%;
      font-size: 25px;
    }
  }
  @media screen and (min-width: 1200px) {
    input {
      width: 250px;
    }
    #title {
      margin-top: 5%;
      font-size: 30px;
    }
  }
  @media screen and (min-width: 1400px) {
    input {
      width: 300px;
    }
    #title {
      margin-top: 5%;
      font-size: 35px;
    }
  }

  @media screen and (min-width: 1600px) {
    input {
      width: 400px;
    }
    #title {
      margin-top: 5%;
      font-size: 40px;
    }
  }
</style>
