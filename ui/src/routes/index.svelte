<script>
   // @ts-nocheck
   import ModalConfirmation from "../components/modal/modalConfirmation.svelte";
   import Feed from "../components/components/feed.svelte";
   import Title from "../components/title/title.svelte";
   import messageQuery from "../utils/checkMessage";
   import blockForbiddenChars from "../utils/presanitize";
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
   let objData = {
      codData: [],
      prodTime: [],
      image: [],
   };
   // const e = getData();
   // const i = getTempo();
   // const z = getImagem();
   let message = "";
   let rip = false;
   let resulFetch;
   let result = getTempo() || "";
   export let timeBar;
   let goBack = `Tentar novamente...`
   let superTitle = `Supervisor`
   let timeUp = `Tempo excecido...`
   let messageArea = false

   // async function getResult(){

   //    // await Promise.reject(getData()).then(res => console.log('res in reject', res))

   //    // Promise.resolve(getData()).then(res => console.log('res in getData', res))
   //    // Promise.resolve(getImagem()).then(res => console.log('res in getImagem', res))
   //    // Promise.resolve(getTempo()).then(res => console.log('res in getTempo', res))
   //    const x = await Promise.allSettled([getData(0), getTempo(), getImagem()]).then(res => console.log("res in", res)).catch((err) => console.log('err', err))
   //    return x;
   //    // if(x === 'rejected'){
   //    //    return messageQuery(0)
   //    // } else {
   //    //    return messageQuery(1)
   //    // }
   // }

   async function redirect() {
      const res = await fetch(redirectRoute);
      objData = await res.json();
      if (objData.message === messageQuery(1)) {
         window.location.href = messageQuery(20);
      }
   }

   async function front() {
      const res = await fetch(veriFyIfPoin);
      resulFetch = await res.json();
      console.log("resultFetch", resulFetch);
      if (resulFetch.status) {
         return (window.location.href = messageQuery(18));
      } else {
         message = "Odf não apontada";
      }
   }

   // async function getData() {
   //    const res = await fetch(callOdfData);
   //    objData.codData = await res.json();
   //    console.log('objData.codData', objData.codData);
   //    if(objData.codData.code === messageQuery(10) ||  objData.codData.code ===  messageQuery(11)||  objData.codData.code === messageQuery(12)){
   //       rip = true
   //    }
   // }

   async function getTempo() {
      const res = await fetch(statusUrlApi);
      objData.prodTime = await res.json();
      const Id = await fetch(imageUrl);
      objData.image = await Id.json();
      const IA = await fetch(callOdfData);
      objData.codData = await IA.json();

      if (objData.prodTime.data <= 0) {
         message = messageQuery(24);
      }

      console.log('objData.codData.data.odfSelecionada.QTDE.LIB', objData.codData.data.odfSelecionada.QTDE_LIB);

      if(objData.codData.data.odfSelecionada.QTDE_LIB <= 0){
         messageArea = true
         return message = messageQuery(4)
      }

      console.log(" objData.codData", objData.codData);
      console.log(" objData.prodTime", objData.prodTime);
      console.log(" objData.image", objData.image);
   }

   // async function getImagem() {
   //    const res = await fetch(imageUrl);
   //    objData.image = await res.json();
   // }

   function close() {
      location.reload()
      message = messageQuery(0);
   }

   // const postCallSupervisor = async (event) => {
   //     const x = await verifyStringLenght(event, supervisor, 6, 8);
   //     if (x === "Success") {
   //         const res = await post(supervisorApi, supervisor);
   //         if (res.message === "Supervisor encontrado") {
   //             modalSuper = false;
   //             clearInterval(barTime);
   //         }
   //     } else {
   //         supervisor = "";
   //         message = "Crachá inválido";
   //     }
   // };

   async function checkForSuper(event) {
      const res = await verifyStringLenght( event.detail.eventType, supervisor, 6, 14);
      if (res === messageQuery(1)) {
         loader = true;
         const res = await post(supervisorApi, { supervisor });
         loader = false;
         if (res.status === messageQuery(1) && res.data.length > 0) {
            return (message = messageQuery(0));
         } else if (res.data.length <= 0) {
            return (message = messageQuery(25));
         }
      } else {
         supervisor = messageQuery(0);
      }
   }

   console.log("result", result);
</script>

{#if loader === true}
   <div class="image-loader">
      <div class="loader">
         <img src={imageLoader} alt="" />
      </div>
   </div>
{/if}
<!-- 
{#if modalSuper === true}
    <div class="background-modal">
        <div class="modal-content">
            <div class="modal-display">
                <h2 class="modal-title">Tempo Excedido</h2>
                <h3 class="modal-subtitle">
                    Insira um supervisor para continuar
                </h3>

                <input
                    autocomplete="off"
                    autofocus
                    bind:value={supervisor}
                    on:keypress={checkForSuper}
                    on:input={blockForbiddenChars}
                    type="text"
                />
            </div>
        </div>
    </div>
{/if} -->

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

      {#if messageArea === false }
      <Title odfData={objData} />
      <Feed odfData={objData} />
         
      {/if}
   </div>
{/await}

{#if message === messageQuery(4) && messageArea === true}
   <Message titleInMessage={message} btnInMessage={goBack} on:message={redirect} />
{/if}

{#if message === messageQuery(24)}
   <Supervisor bind:supervisor={supervisor} titleSupervisor={superTitle} subTitle={timeUp} on:message={checkForSuper} />
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
