<script>
   // @ts-nocheck
   import ModalConfirmation from "../components/modal/modalConfirmation.svelte";
   import BadFeedInput from "../components/components/badFeedInput.svelte";
   import Supervisor from "../components/components/supervisor.svelte";
   import Message from "../components/components/message.svelte";
   import { verifyStringLenght } from "../utils/verifyLength";
   import Feed from "../components/components/feed.svelte";
   import Title from "../components/title/title.svelte";
   import messageQuery from "../utils/checkMessage";
   import post from "../utils/postFunction";
   import StopMotivesInput from "../components/components/stopMotivesInput.svelte";
   const supervisorStop = "api/v1/supervisorParada";
   const urlBadFeedMotive = `/api/v1/badFeedMotives`;
   const veriFyIfPoin = `/api/v1/verifyCodeNote`;
   const imageLoader = "/images/axonLoader.gif";
   const back = "/images/icons8-go-back-24.png";
   const timeUp = `Tempo de produção excedido!`;
   const apiMotivoParada = "api/v1/stopMotives";
   const supervisorApi = `/api/v1/supervisor`;
   const frontImage = "/images/next (2).png";
   const redirectRoute = "/api/v1/clearAll";
   const statusUrlApi = `/api/v1/status`;
   const callOdfData = `/api/v1/odfData`;
   const postParada = `api/v1/stopPost`;
   const goBack = `Tentar novamente...`;
   const imageUrl = `/api/v1/imagem`;
   const pointApi = `/api/v1/point`;
   const superTitle = `Supervisor!`;
   let isRequesting = false;
   let messageArea = false;
   let loader = true;
   let rip = false;
   let resultRedirect;
   let objData = {
      codData: [],
      prodTime: [],
      image: [],
      stopMotives: [],
      badFeedMotive: [],
   };
   let resulFetch;
   let badFeed;
   let valorFeed;
   let reworkFeed;
   let missingFeed;
   let message = "";
   let subTitle = "";
   let supervisor = ``;
   let stopMotiveSelected;
   let stopModal = false;
   let badFeedMotive;
   let showConfirm = false;
   const result = get() || "";
   let color = false;

   async function get() {
      loader = true;
      const res = await fetch(statusUrlApi);
      objData.prodTime = await res.json();
      const Id = await fetch(imageUrl);
      objData.image = await Id.json();
      const IA = await fetch(callOdfData);
      objData.codData = await IA.json();
      const mP = await fetch(apiMotivoParada);
      objData.stopMotives = await mP.json();
      const bad = await fetch(urlBadFeedMotive);
      objData.badFeedMotive = await bad.json();
      loader = false;

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

      if (objData.codData.data.QTDE_LIB <= 0) {
         messageArea = true;
         return (message = messageQuery(4));
      }
   }

   async function close() {
      message = messageQuery(0);
   }

   async function checkForSuper(event) {
      if (event.detail.text === "Close button in badFeedInput") {
         supervisor = messageQuery(0)
         return (showConfirm = false);
      }

      if (event.detail.text === "Go Back!!!") {
         return handleEvents();
      }

      supervisor = event.detail.supervisor;
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
         if (res.status === messageQuery(1) && res.data) {
            callPost(event);
            return (message = messageQuery(25));
         } else {
            return (message = messageQuery(0));
         }
      }
   }

   async function callPost() {
      loader = true;
      const res = await post(pointApi, {
         valorFeed: valorFeed,
         badFeed: badFeed,
         missingFeed: missingFeed,
         reworkFeed: reworkFeed,
         value: badFeedMotive || messageQuery(0),
         supervisor: supervisor,
      });

      isRequesting = false;
      loader = false;

      if (res.code === messageQuery(10)) {
         rip = true;
      }

      if (res.message === messageQuery(10)) {
         window.location.href = messageQuery(18);
      } else if (res.code === messageQuery(16)) {
         message = messageQuery(43);
      } else if (
         res.message === messageQuery(1) &&
         res.address.address &&
         !res.returnValueAddress.address
      ) {
         address =
            res.address.address.length <= 0
               ? messageQuery(52)
               : res.address.address[0].ENDERECO;
      } else if (
         res.message === messageQuery(1) &&
         !res.address &&
         res.returnValueAddress
      ) {
         returnValueAddress = res.returnValueAddress;
         message = messageQuery(44);
      } else if (
         res.message === messageQuery(1) &&
         !res.address &&
         !res.returnValueAddress.address
      ) {
         return (window.location.href = messageQuery(18));
      } else if (res.message === messageQuery(11)) {
         window.location.href = messageQuery(18);
      } else if (
         res.message !== messageQuery(0) &&
         res.data !== messageQuery(0)
      ) {
         message = res.message;
      }
   }

   async function handleEvents(event) {
      if (event.key === "Escape") {
         loader = true;
         const res = await fetch(redirectRoute);
         resultRedirect = await res.json();
         if (resultRedirect.message === messageQuery(1)) {
            window.location.href = messageQuery(20);
         }
      }

      if (event.key === "P" || event.key === "p") {
         if (stopModal === false) {
            stopModal = true;
         } else {
            stopModal = false;
         }
      }
   }

   async function checkStopMachine(event) {
      const res = await verifyStringLenght(
         event.detail.eventType,
         supervisor,
         6,
         14
      );
      if (res === messageQuery(1)) {
         loader = true;
         const res = await post(supervisorStop, { supervisor });
         if (res) {
            if (res.message === messageQuery(1)) {
               callPost(event);
            } else if (res.message !== messageQuery(0)) {
               loader = false;
            }
         }
      }
   }

   async function confirm(event) {
      if (event.detail.text === "Close button in badFeedInput") {
         return (stopModal = false);
      }

      loader = true;
      const res = await post(postParada, { stopMotiveSelected });
      if (res.status) {
         loader = false;
         if (res.message === messageQuery(42)) {
            message = messageQuery(42);
            stopModal = false;
            // showMaqPar = false;
         }
         if (res.message === messageQuery(1)) {
            color = true;
            message = messageQuery(43);
            stopModal = false;
            // showMaqPar = true;
         }
      }
   }

   async function openStop() {
      if (stopModal === false) {
         stopModal = true;
      } else {
         stopModal = false;
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

   async function checkPost(event) {
      // isRequesting = true;
      const numberQtdAllowed = Number(objData.codData.data.QTDE_LIB || 0);
      badFeed = Number(event.detail.badFeed || 0);
      valorFeed = Number(event.detail.valorFeed || 0);
      missingFeed = Number(event.detail.missingFeed || 0);
      reworkFeed = Number(event.detail.reworkFeed || 0);
      const total = badFeed + valorFeed + missingFeed + reworkFeed;

      if (missingFeed > 0 && badFeed + valorFeed + reworkFeed === 0) {
         return (message = messageQuery(48));
      } else if (reworkFeed > 0 && badFeed + valorFeed + missingFeed === 0) {
         return (message = messageQuery(49));
      } else if (
         reworkFeed > 0 &&
         missingFeed > 0 &&
         badFeed + valorFeed === 0
      ) {
         return (message = messageQuery(50));
      } else if (
         (missingFeed > 0 &&
            valorFeed > 0 &&
            valorFeed < numberQtdAllowed &&
            badFeed + reworkFeed === 0) ||
         (reworkFeed > 0 &&
            valorFeed > 0 &&
            valorFeed < numberQtdAllowed &&
            badFeed + missingFeed === 0) ||
         (valorFeed > 0 && missingFeed > 0 && reworkFeed > 0 && badFeed <= 0) ||
         (badFeed + missingFeed + reworkFeed === 0 &&
            valorFeed > 0 &&
            valorFeed < numberQtdAllowed)
      ) {
         return (message = messageQuery(46));
      } else if (total > numberQtdAllowed) {
         message = messageQuery(47);
      } else if (badFeed > 0 && total <= numberQtdAllowed) {
         showConfirm = true;
      } else if (total === 0) {
         message = messageQuery(45);
      } else if (
         badFeed + missingFeed + reworkFeed === 0 &&
         valorFeed === numberQtdAllowed
      ) {
         callPost(event);
      }
   }
</script>

<svelte:window on:keydown={handleEvents} />

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
                  on:keypress={handleEvents}
                  on:click={handleEvents}
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
                  on:keypress={handleEvents}
                  on:click={handleEvents}
               >
                  <img src={back} alt="" /> Código de barras</a
               >
            </div>
         {/if}
      </div>

      {#if messageArea === false}
         <Title odfData={objData} on:message={openStop} />
         <Feed
            odfData={objData}
            bind:badFeed
            bind:valorFeed
            bind:missingFeed
            bind:reworkFeed
            bind:isRequesting
            on:message={checkPost}
         />
      {/if}
   </div>
{/await}

{#if message === messageQuery(4) && messageArea === true}
   <Message
      titleInMessage={message}
      btnInMessage={goBack}
      on:message={handleEvents}
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

{#if message && message !== messageQuery(0) && message !== messageQuery(24) && message !== messageQuery(4) && message !== messageQuery(16) && message !== messageQuery(43) && message !== messageQuery(46)}
   <ModalConfirmation on:message={close} {message} title={message} />
{/if}

{#if message === "Máquina parada"}
   <Supervisor
      titleSupervisor={message}
      {subTitle}
      bind:supervisor
      on:message={checkStopMachine}
   />
{/if}

{#if message === messageQuery(46)}
   <Supervisor
      titleSupervisor={message}
      {subTitle}
      bind:supervisor
      on:message={callPost}
   />
{/if}

{#if showConfirm === true}
   <BadFeedInput
      titleToMotive={"Apontamento com refugo"}
      odfData={objData}
      {supervisor}
      bind:selectedValue={badFeedMotive}
      on:message={checkForSuper}
   />
   <!-- <div class="background">
            <div class="header">
                <div class="closed">
                    <h3>Apontamento com refugo</h3>
                </div>
                <select bind:value={badFeedMotive}>
                    {#each data.data.data.map((acc) => acc.DESCRICAO) ? data.data.data.map((acc) => acc.DESCRICAO) : ["PEÇA DANIFICADA"]  as item}
                        <option>{item}</option>
                    {/each}
                </select>
                <p>Supervisor</p>
                <input
                    on:input={blockForbiddenChars}
                    on:keypress={checkForSuper}
                    bind:value={supervisor}
                    autofocus
                    class="supervisor"
                    type="text"
                    name="supervisor"
                    id="supervisor"
                />
                <div class="modalFooter">
                    <button on:keypress={close} on:click={close}>Fechar</button>
                </div>
            </div>
        </div> -->
{/if}

{#if stopModal === true}
   <StopMotivesInput
      titleToMotive={"Motivo da Parada"}
      odfData={objData}
      {supervisor}
      bind:selectedValue={stopMotiveSelected}
      on:message={confirm}
   />
   <!-- <div class="modalBackground">
      <div class="itensInsideModal">
         <div class="closePopDiv">
            <button class="btnPop" on:keypress={closePop} on:click={closePop}
               >FECHAR</button
            >
         </div>

         <div class="modalContent">
            <h2 class="modalTitle">Motivo da Parada</h2>
            <div class="optionsBar">
               <select autofocus tabindex="10" bind:value>
                  {#each objData.stopMotives.data.map((acc) => acc.DESCRICAO) ? objData.stopMotives.data.map((acc) => acc.DESCRICAO) : ["Parar máquina"] as item}
                     <option class="optionsBar">{item}</option>
                  {/each}
               </select>
            </div>

            <div class="confirmPopDiv">
               <button
                  class="btnPopConfirm"
                  id="confirmPop"
                  tabindex="11"
                  on:keypress={confirm}
                  on:click={confirm}
               >
                  CONFIRMAR
               </button>
            </div>
         </div>
      </div>
   </div> -->
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
