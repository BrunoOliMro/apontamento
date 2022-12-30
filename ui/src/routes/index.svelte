<script>
   import Title from "../components/title/title.svelte";
   import Feed from "../components/components/feed.svelte";
   import Message from "../components/components/message.svelte";
   const imageLoader = "/images/axonLoader.gif";
   const redirectRoute = "/api/v1/clearAll";
   const back = "/images/icons8-go-back-24.png";
   const callOdfData = `/api/v1/odfData`;
   let loader = false;
   export let data = [];
   var message;
   let result = getData();

   async function redirect() {
      const res = await fetch(redirectRoute);
      data = await res.json();
      if (data.message === "Success") {
         window.location.href = "/#/codigobarras/";
      }
   }

   async function getData() {
      const res = await fetch(callOdfData);
      data = await res.json();
      loader = false;
      if (data) {
         if (data.message === "Success") {
            if (data.odfSelecionada) {
               var availableQuantity = data.odfSelecionada.QTDE_LIB;
            } else {
               return (window.location.href = `/#/codigobarras`);
            }
         } else if (
            data.message === "codeApont 5 inicio de rip" ||
            data.message === "codeApont 4 prod finalzado"
         ) {
            return (window.location.href = `/#/rip`);
         } else if (data.message !== "") {
            message = data.message;
         }
      } else {
         return (window.location.href = `/#/codigobarras`);
      }
   }
</script>

<main>
   {#await result}
      <div class="image-loader">
         <div class="loader">
            <img src={imageLoader} alt="" />
         </div>
      </div>
   {:then}
      <!-- svelte-ignore a11y-positive-tabindex -->
      <a
         tabindex="8"
         href="/#/codigobarras/"
         on:keypress={redirect}
         on:click={redirect}
      >
         <img src={back} alt="" /> Código de barras
      </a>
      {#if data.length > 0}
         <Title odfData={data} />
         <Feed odfData={data} />
      {:else}
         <Message on:message={redirect} />
      {/if}
   {/await}
</main>

<style>
   .loader {
      margin: 0%;
      position: relative;
      width: 10vw;
      height: 5vw;
      padding: 1.5vw;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999999999999999;
   }
   .image-loader {
      margin: 0%;
      padding: 0%;
      position: fixed;
      top: 0;
      left: 0;
      background-color: black;
      height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999999999999;
   }
   a {
      margin: 0%;
      padding: 0%;
      color: #252525;
      font-size: 20px;
   }
   a:hover {
      transition: all 1s;
      opacity: 0.8;
   }
   main {
      margin-left: 1%;
      margin-right: 1%;
      margin-top: 5px;
      margin-bottom: 1%;
      padding: 0%;
   }
</style>
