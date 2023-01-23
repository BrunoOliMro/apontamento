<script>
   // @ts-nocheck
   import ModalConfirmation from "../components/modal/modalConfirmation.svelte";
   import Feed from "../components/components/feed.svelte";
   import Title from "../components/title/title.svelte";
   import messageQuery from "../utils/checkMessage";
   import Supervisor from "../components/components/supervisor.svelte";
   import { verifyStringLenght } from "../utils/verifyLength";
   import post from "../utils/postFunction";
   import Message from "../components/components/message.svelte";
   const veriFyIfPoin = `/api/v1/verifyCodeNote`;
   const imageLoader = "/images/axonLoader.gif";
   const back = "/images/icons8-go-back-24.png";
   const frontImage = "/images/next (2).png";
   const redirectRoute = "/api/v1/clearAll";
   const statusUrlApi = `/api/v1/status`;
   const callOdfData = `/api/v1/odfData`;
   const imageUrl = `/api/v1/imagem`;
   const supervisorApi = `/api/v1/supervisor`;
   let supervisor = ``;
   let loader = false;
   let resultRedirect;
   let objData = {
      codData: [],
      prodTime: [],
      image: [],
   };
   let message = "";
   let rip = false;
   let resulFetch;
   let result = getTempo() || "";
   let goBack = `Tentar novamente...`;
   let superTitle = `Supervisor`;
   let timeUp = `Tempo excecido...`;
   let messageArea = false;

   async function redirect() {
      const res = await fetch(redirectRoute);
      resultRedirect = await res.json();
      if (resultRedirect.message === messageQuery(1)) {
         window.location.href = messageQuery(20);
      }
   }

   async function front() {
      const res = await fetch(veriFyIfPoin);
      resulFetch = await res.json();
      if (resulFetch.status) {
         return (window.location.href = messageQuery(18));
      } else {
         message = "Odf não apontada";
      }
   }

   async function getTempo() {
      const res = await fetch(statusUrlApi);
      objData.prodTime = await res.json();
      const Id = await fetch(imageUrl);
      objData.image = await Id.json();
      const IA = await fetch(callOdfData);
      objData.codData = await IA.json();

      if (
         objData.codData.code === messageQuery(10) ||
         objData.codData.code === messageQuery(11)
      ) {
         rip = true;
      }

      if (!objData.prodTime.supervisor) {
         if (objData.prodTime.data <= 0) {
            message = messageQuery(24);
         }
      }

      if (objData.codData.data.odfSelecionada.QTDE_LIB <= 0) {
         messageArea = true;
         return (message = messageQuery(4));
      }
   }

   function close() {
      location.reload();
      message = messageQuery(0);
   }

   async function checkForSuper(event) {
      if (event.detail.text === "Go Back!!!") {
         return redirect();
      }

      const res = await verifyStringLenght(
         event.detail.eventType,
         supervisor,
         6,
         14
      );
      if (res === messageQuery(1)) {
         loader = true;
         const res = await post(supervisorApi, { supervisor });
         loader = false;
         if (res.status === messageQuery(1) && res.data.length <= 0) {
            location.reload();
            return (message = messageQuery(25));
         } else {
            return (message = messageQuery(0));
         }
      }
   }
</script>

{#if loader === true}
   <div class="image-loader">
      <div class="loader">
         <img src={imageLoader} alt="" />
      </div>
   </div>
{/if}

{#await result}
   <div class="image-loader">
      <div class="loader">
         <img src={imageLoader} alt="" />
      </div>
   </div>
{:then}
   <!-- svelte-ignore a11y-positive-tabindex -->
   <div>
      <div class="breadcrumb-area">
         {#if rip === true}
            <div class="cod-area">
               <a
                  tabindex="8"
                  href={messageQuery(20)}
                  on:keypress={redirect}
                  on:click={redirect}
               >
                  <img src={back} alt="" /> Código de barras</a
               >
            </div>

            <div class="rip-area">
               <p
                  tabindex="8"
                  href={messageQuery(0)}
                  on:keypress={front}
                  on:click={front}
               >
                  Rip
                  <img src={frontImage} alt="" />
               </p>
            </div>
         {:else}
            <div class="cod-area-basic">
               <a
                  tabindex="8"
                  href={messageQuery(20)}
                  on:keypress={redirect}
                  on:click={redirect}
               >
                  <img src={back} alt="" /> Código de barras</a
               >
            </div>
         {/if}
      </div>

      {#if messageArea === false}
         <Title odfData={objData} />
         <Feed odfData={objData} />
      {/if}
   </div>
{/await}

{#if message === messageQuery(4) && messageArea === true}
   <Message
      titleInMessage={message}
      btnInMessage={goBack}
      on:message={redirect}
   />
{/if}

{#if message === messageQuery(24)}
   <Supervisor
      bind:supervisor
      titleSupervisor={superTitle}
      subTitle={timeUp}
      on:message={checkForSuper}
   />
{/if}

{#if message && message !== messageQuery(0) && message !== messageQuery(24) && message !== messageQuery(4)}
   <ModalConfirmation on:message={close} {message} title={message} />
{/if}

<style>
   p {
      text-decoration: underline;
      margin: 0%;
      padding: 0%;
      color: #252525;
      font-size: 20px;
   }

   p:hover {
      cursor: pointer;
   }

   .cod-area-basic {
      width: 50%;
      margin: 0%;
      padding: 0%;
      display: flex;
      flex-direction: row;
      align-items: left;
      justify-content: left;
      text-align: left;
   }
   .rip-area {
      width: 50%;
      margin: 0%;
      padding: 0%;
      display: flex;
      flex-direction: row;
      align-items: right;
      text-align: right;
      justify-content: right;
   }

   .cod-area {
      width: 50%;
      padding: 0%;
      margin: 0%;
      display: flex;
      flex-direction: row;
      align-items: left;
      text-align: left;
      justify-content: left;
   }
   .breadcrumb-area {
      margin: 0%;
      padding: 0%;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: left;
      text-align: left;
      justify-content: left;
   }

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
   div {
      margin-left: 1%;
      margin-right: 1%;
      margin-top: 5px;
      margin-bottom: 1%;
      padding: 0%;
   }
</style>
