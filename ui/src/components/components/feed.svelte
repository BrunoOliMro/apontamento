<script>
    // @ts-nocheck
    import { verifyStringLenght } from "../../utils/verifyLength";
    import blockForbiddenChars from "../../utils/presanitize";
    import messageQuery from "../../utils/checkMessage";
    import GoodFeed from "../inputs/goodFeed.svelte";
    import Missing from "../inputs/missing.svelte";
    import Rework from "../inputs/rework.svelte";
    import post from "../../utils/postFunction";
    import Bad from "../inputs/bad.svelte";
    import Footer from "./footer.svelte";
    import Status from "./status.svelte";
    import Cod from "./cod.svelte";
    import ModalConfirmation from "../modal/modalConfirmation.svelte";
    import Supervisor from "./supervisor.svelte";
    let urlBadFeedMotive = `/api/v1/badFeedMotives`;
    let supervisorStop = "api/v1/supervisorParada";
    let imageLoader = "/images/axonLoader.gif";
    let pointApi = `/api/v1/point`;
    let showConfirm = false;
    let loader = false;
    var address = "";
    let supervisor = "";
    let message = "";
    let data = [];
    let badFeed;
    let missingFeed;
    let reworkFeed;
    let valorFeed;
    let value;
    let getSpace;
    let balance;
    let supervisorMaq;
    let isRequesting = false;
    let resultRefugo = motives();
    let arrayMotives = [];
    export let odfData;
    let availableQuantity = 0
    let subTitle = ""

    if(!odfData.codData.data){
        odfData.codData.data = 'S/I'
    } else {
        availableQuantity = odfData.codData.data.odfSelecionada.QTDE_LIB;
    }



    async function checkStopMachine (event){
        const res = await verifyStringLenght(event, supervisorMaq, 6, 14)
        if(res === messageQuery(1)){
            postStop();
        }
    }

    const postStop = async () => {
        const res = await post(supervisorStop, supervisor);
        if (res) {
            if (res.message === messageQuery(1)) {
                callPost();
            }
            if (res.message !== messageQuery(0)) {
                loader = false;
            }
        }
    };

    async function motives() {
        const res = await fetch(urlBadFeedMotive);
        data = await res.json();
        if(data.data.data){
            arrayMotives = data.data.data.map(acc => acc.DESCRICAO)
        } else {
            arrayMotives = ['PEÇA DANIFICADA']
        }
    }

    async function checkForSuper(event) {
        const result = await verifyStringLenght(event, supervisor, 6, 14);
        if (result === messageQuery(1)) {
            callPost();
        } 
    }

    const callPost = async () => {
        isRequesting = true
        loader = true;
        close();
        const res = await post(pointApi, {
            valorFeed,
            badFeed,
            missingFeed,
            reworkFeed,
            value,
            supervisor,
        });
        if (res) {
            console.log('res in callPost', res);
            isRequesting = false
            loader = false
            if (res.message === "Apontamento parcial") {
                message = "Apontamento parcial";
            } else if (res.message === "Pointed") {
                window.location.href =  messageQuery(18);
                location.reload();
            } else if (res.code === "Machine has stopped") {
                message = "Máquina parada";
            } else if (res.message === "Jumping steps") {
                window.location.href = messageQuery(20);
                location.reload();
            } else if (res.message === "Saldo menor que o apontado") {
                balance = res.balance;
            } else if (res.message === messageQuery(1)) {
                getSpaceFunc();
            } else if (res.message === "Rip iniciated") {
                window.location.href = messageQuery(18);
                location.reload();
            }  else if (res.message !== messageQuery(0)) {
                message = res.message;
            }
        }
    };

    async function getSpaceFunc() {
        isRequesting = true
        loader = true;
        const res = await fetch(pointApi);
        getSpace = await res.json();
        console.log('getSpace', getSpace);
        if (getSpace) {
            loader = false;

            if(getSpace.message === messageQuery(35)){
                return window.location.href = messageQuery(18)
            } else if (getSpace.message === messageQuery(1)) {
                address = getSpace.address;
            } else if (getSpace.message === messageQuery(4)) {
                address = "5A01A01-11";
            }
        }
    }

    async function checkPost() {
        isRequesting = true;
        const numberBadFeed = Number(badFeed || 0);
        const numberGoodFeed = Number(valorFeed || 0);
        const numberQtdAllowed = Number(availableQuantity || 0);
        const numberMissing = Number(missingFeed || 0);
        const numberReworkFeed = Number(reworkFeed || 0);
        const total = numberBadFeed + numberGoodFeed + numberMissing + numberReworkFeed;

        try {
            if(numberMissing > 0 && numberBadFeed + numberGoodFeed + numberReworkFeed === 0){
                return message = 'Apontar apenas faltantes, confirma?'
            } else  if ( numberReworkFeed > 0 && numberBadFeed + numberGoodFeed + numberMissing === 0) {
                return (message = "Apontando apenas peças retrabalhadas, confirma ?");
            } else if ( numberReworkFeed > 0 && numberMissing > 0 && numberBadFeed + numberGoodFeed === 0) {
                return (message ="Apontando apenas peças retrabalhadas e peças faltantes, confirma ?");
            } else if ((numberMissing > 0 && numberGoodFeed > 0 && numberGoodFeed < numberQtdAllowed && numberBadFeed + numberReworkFeed === 0) ||
                (numberReworkFeed > 0 && numberGoodFeed > 0 && numberGoodFeed < numberQtdAllowed && numberBadFeed + numberMissing === 0)) {
                return (message = "Apontamento parcial");
            } else if (total > numberQtdAllowed) {
                message = "Quantidade excedida";
            } else  if (numberBadFeed > 0 && total <= numberQtdAllowed) {
                showConfirm = true;
            } else if (total === 0) {
                message = "Apontamento vazio";
            } else if ( numberBadFeed + numberMissing + numberReworkFeed === 0 && numberGoodFeed > 0 && numberGoodFeed < numberQtdAllowed ) {
                message = "Apontamento parcial";
            } else if ( numberBadFeed + numberMissing + numberReworkFeed === 0 && numberGoodFeed === numberQtdAllowed) {
                callPost();
            }
        } catch (error) {
            console.log('Error on CheckPost function checking sended Numbers', error)
            return message = messageQuery(4)
        } finally {
            isRequesting = false
        }
    }

    function close() {
        address = "";
        message = "";
        showConfirm = false;
    }

    // function closeRedirectBarcode() {
    //     loader = true;
    //     message = "";
    //     address = false;
    //     window.location.href =  messageQuery(20);
    // }

    function closeRedirect() {
        loader = true;
        message = "";
        address = false;
        window.location.href = messageQuery(18);
    }

    function callGoodFeed(event) {
        valorFeed = event.detail.goodFeed;
        if (event.key === "Enter") {
            checkPost();
        }
    }

    function callBadFeed(event) {
        badFeed = event.detail.badFeed;
    }

    function callMissingFeed(event) {
        missingFeed = event.detail.missingFeed;
    }

    function callReworkFeed(event) {
        reworkFeed = event.detail.reworkFeed;
    }
</script>

{#if loader === true}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{/if}

{#await odfData.codData.data}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then}
    <div class="content">
        <div class="status-area">
            <div><Status {odfData} /></div>
            <div><Cod {odfData} /></div>
        </div>
        <div class="feed-content">
            <div class="footer-area">
                <Footer {odfData} />
            </div>
            <div class="feed-area">
                <div class="feed-area-div">
                    <GoodFeed
                        autofocus
                        tabindex="1"
                        on:keypress={callGoodFeed}
                        on:message={callGoodFeed}
                    />
                </div>
                <div class="feed-area-div">
                    <Bad tabindex="2" on:message={callBadFeed} />
                </div>
                <div class="feed-area-div">
                    <Missing tabindex="3" on:message={callMissingFeed} />
                </div>
                <div class="feed-area-div">
                    <Rework tabindex="4" on:message={callReworkFeed} />
                </div>
            </div>
            <div class="buttonApontar">
                <!-- svelte-ignore a11y-positive-tabindex -->
                <a
                    disabled={isRequesting === true}
                    tabindex="5"
                    id="apontar"
                    on:keypress|preventDefault={checkPost}
                    on:click|preventDefault={checkPost}
                    type="submit"
                >
                    <span />
                    <span />
                    <span />
                    <span />
                    APONTAR
                </a>
            </div>
        </div>
    </div>

    {#await resultRefugo}
        <div class="imageLoader">
            <div class="loader">
                <img src={imageLoader} alt="" />
            </div>
        </div>
    {:then}
        {#if showConfirm === true}
            <div class="background">
                <div class="header">
                    <div class="closed">
                        <h3>Apontamento com refugo</h3>
                    </div>
                    <select bind:value>
                        {#each arrayMotives as item}
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
                        <button on:keypress={close} on:click={close}
                            >Fechar</button
                        >
                    </div>
                </div>
            </div>
        {/if}
    {/await}

   {#if message === "Apontamento parcial"}
        
        <Supervisor titleSupervisor={message} subTitle={subTitle}  bind:supervisor={supervisor} on:message={callPost}/>

        <!-- <div class="background">
            <div class="header">
                <div class="content-area">
                    <div class="modalTitle">
                        <h3>{message}</h3>
                    </div>
                    <div class="modalContent">
                        <div class="modalCenter">
                            <h4>Informe o supervisor:</h4>
                            <div class="input">
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
                            </div>
                        </div>
                    </div>
                    <div class="modalFooter">
                        <button on:keypress={close} on:click={close}
                            >Fechar</button
                        >
                    </div>
                </div>
            </div>
        </div> -->
    {/if}

    {#if message === "Apontando apenas peças retrabalhadas, confirma ?" || message === 'Apontar apenas faltantes, confirma?'}
        <div class="background">
            <div class="header">
                <div class="content-area">
                    <div class="modalTitle">
                        <h3>{message}</h3>
                    </div>
                    <div class="modalContent">
                        <div class="modalCenter">
                            <h4>Informe o supervisor:</h4>
                            <div class="input">
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
                            </div>
                        </div>
                    </div>
                    <div class="modalFooter">
                        <button on:keypress={close} on:click={close}
                            >Fechar</button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/if}

    {#if message === "Apontando apenas peças retrabalhadas e peças faltantes, confirma ?"}
        <div class="background">
            <div class="header">
                <div class="content-area">
                    <div class="modalTitle">
                        <h3>{message}</h3>
                    </div>
                    <div class="modalContent">
                        <div class="modalCenter">
                            <h4>Informe o supervisor:</h4>
                            <div class="input">
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
                            </div>
                        </div>
                    </div>
                    <div class="modalFooter">
                        <button on:keypress={close} on:click={close}
                            >Fechar</button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/if}

    {#if message === "Máquina parada"}
        <div class="background">
            <div class="header">
                <div class="closed">
                    <h2>Máquina parada</h2>
                </div>
                <div>
                    <div>
                        <p>Chame um supervisor</p>
                    </div>
                    <div>
                        <input
                            autofocus
                            tabindex="12"
                            id="supervisor"
                            name="supervisor"
                            type="text"
                            on:input={blockForbiddenChars}
                            on:keypress={checkStopMachine}
                            onkeyup="this.value = this.value.toUpperCase()"
                            bind:value={supervisorMaq}
                        />
                    </div>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if message === "Already pointed"}
        <div class="background">
            <div class="header">
                <div class="closed">
                    <h2>
                        ODF apontada, finalize o processo.
                    </h2>
                </div>
                <button on:click={close} on:keypress={close}>Fechar</button>
                <button on:keypress={closeRedirect} on:click={closeRedirect}
                    >Continuar</button
                >
            </div>
        </div>
    {/if}

    <!-- {#if message && message !== messageQuery(0) && message !== "Apontamento parcial" && message !== "Already pointed" && message !== "Máquina parada" && message !== "Apontando apenas peças retrabalhadas e peças faltantes, confirma ?" && message !== "Apontando apenas peças retrabalhadas, confirma ?" && message !== 'Apontar apenas faltantes, confirma?'}
        <div class="background">
            <div class="header">
                <div class="closed">
                    <h2>{message}</h2>
                </div>
                <button tabindex="7" on:keypress={close} on:click={close}>Fechar</button>
            </div>
        </div>
    {/if} -->

    <!-- {#if message === messageQuery(4)}
        <div class="background">
            <div class="header">
                <div class="closed">
                    <h2>{message}</h2>
                </div>
                <button
                    tabindex="7"
                    on:keypress={closeRedirectBarcode}
                    on:click={closeRedirectBarcode}>fechar</button
                >
            </div>
        </div>
    {/if} -->

    {#if message && message !== messageQuery(0) && message !== "Apontamento parcial" && message !== 'Máquina parada' }
        <ModalConfirmation on:message={close} message={message} title={message} on:message={close}/>
    {/if}

    {#if address && address !== ""}
        <div class="background">
            <div class="header">
                <div class="closed">
                    <h2>
                        Insira a quantidade apontada no endereço : {address}
                    </h2>
                </div>
                <button on:keypress={closeRedirect} on:click={closeRedirect}
                    >Continuar</button
                >
            </div>
        </div>
    {/if}
{/await}

<style>
    h3 {
        width: 100%;
        font-size: 45px;
        margin: 0%;
        padding: 0%;
        display: flex;
        justify-content: left;
        text-align: left;
        text-align: left;
    }
    h4 {
        width: 100%;
        font-size: 28px;
        margin: 0%;
        padding: 0%;
    }
    .footer-area {
        display: flex;
        width: 100%;
        height: 100%;
    }
    .feed-area {
        margin-top: 50px;
        display: grid;
    }
    .feed-area-div {
        margin: 4%;
    }
    .feed-content {
        display: flex;
        width: 50%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    button {
        letter-spacing: 0.5px;
        width: 100%;
        height: 28px;
    }
    .modalTitle {
        margin-left: 0px;
        margin-bottom: 25px;
        margin-right: 0px;
        margin-top: 0px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
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
    }
    .imageLoader {
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
    }

    h2 {
        font-size: 55px;
        margin: 0px, 0px, 0px, 0px;
        padding: 0px;
        width: 450px;
        align-items: left;
        text-align: left;
        justify-content: left;
        display: flex;
    }
    select {
        width: 350px;
        height: 25px;
        background-color: #252525;
        border-radius: 5px;
        color: #fff;
    }
    option {
        font-size: 18px;
        background-color: #252525;
    }

    .buttonApontar {
        margin-top: 110px;
        margin-bottom: 20px;
        padding: 0%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        z-index: 1;
    }
    #apontar {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        z-index: 1;
        height: 65px;
        width: 400px;
        margin: 0%;
        padding: 0%;
    }
    .feed-area {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 50%;
    }

    .status-area {
        margin: 0%;
        padding: 0%;
        /* height: 100%; */
        width: 50%;
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: left;
        text-align: left;
    }
    .content {
        width: 100%;
        margin: 0%;
        padding: 0%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        text-align: center;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        border-radius: 6px;
    }
    button {
        display: flex;
        justify-content: right;
        text-align: right;
        align-items: right;
        border: none;
        background-color: transparent;
        color: white;
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
        z-index: 99999999999;
    }
    .imageLoader {
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
        z-index: 999999999999;
    }
    .supervisor {
        height: 25px;
    }
    h2 {
        width: 460px;
        justify-content: center;
        display: flex;
    }
    .closed {
        display: flex;
        flex-direction: row;
        justify-content: center;
        text-align: center;
        align-items: center;
    }
    select {
        width: 200px;
        background-color: #252525;
        border-radius: 5px;
        color: #fff;
    }
    option {
        width: 35px;
        background-color: #252525;
    }
    a {
        position: relative;
        display: inline-block;
        padding: 10px 20px;
        color: #fff;
        font-size: 16px;
        text-decoration: none;
        text-transform: uppercase;
        overflow: hidden;
        transition: 0.5s;
        margin-top: 40px;
        letter-spacing: 4px;
        border-radius: 8px;
        background-color: black;
        z-index: 1;
        width: 140px;
    }
    a:hover {
        color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 2.5px white, 0 0 12.5px white, 0 0 25px white,
            0 0 1px white;
    }
    a span {
        position: absolute;
        display: block;
    }
    a span:nth-child(1) {
        top: 0;
        left: -100%;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, transparent, #038c6b);
        animation: btn-anim1 2s linear infinite;
    }
    @keyframes btn-anim1 {
        0% {
            left: -100%;
        }
        50%,
        100% {
            left: 100%;
        }
    }
    a span:nth-child(2) {
        top: -100%;
        right: 0;
        width: 3px;
        height: 100%;
        background: linear-gradient(180deg, transparent, #038c6b);
        animation: btn-anim2 2s linear infinite;
        animation-delay: 0.25s;
    }
    @keyframes btn-anim2 {
        0% {
            top: -100%;
        }
        50%,
        100% {
            top: 100%;
        }
    }
    a span:nth-child(3) {
        bottom: 0;
        right: -100%;
        width: 100%;
        height: 3px;
        background: linear-gradient(270deg, transparent, #038c6b);
        animation: btn-anim3 2s linear infinite;
        animation-delay: 0.5s;
    }
    @keyframes btn-anim3 {
        0% {
            right: -100%;
        }
        50%,
        100% {
            right: 100%;
        }
    }
    a span:nth-child(4) {
        bottom: -100%;
        left: 0;
        width: 3px;
        height: 100%;
        background: linear-gradient(360deg, transparent, #038c6b);
        animation: btn-anim4 2s linear infinite;
        animation-delay: 0.75s;
    }
    @keyframes btn-anim4 {
        0% {
            bottom: -100%;
        }
        50%,
        100% {
            bottom: 100%;
        }
    }

    .content-area {
        width: 100%;
        margin: 0%;
        padding: 0%;
    }

    .input {
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        margin: 0%;
        width: 100%;
        padding: 0%;
    }

    .modalTitle {
        margin-left: 1%;
        margin-bottom: 5%;
        padding: 0%;
        width: 100%;
        justify-content: left;
        align-items: left;
        text-align: center;
    }
    .modalFooter {
        margin: 0%;
        padding: 0%;
        display: flex;
        flex-direction: row;
        align-items: right;
        text-align: right;
        justify-content: right;
    }

    .modalContent {
        margin: 0%;
        padding: 0%;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        text-align: center;
    }

    .modalCenter {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 100%;
        margin: 0%;
        padding: 0%;
    }
    .header {
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        width: 550px;
        height: 375px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 10px;
        z-index: 9;
    }

    .background {
        margin: 0%;
        padding: 0%;
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
        z-index: 8;
    }

    p {
        font-size: 35px;
        width: fit-content;
        height: fit-content;
        margin: 0%;
        padding: 0%;
    }

    input {
        width: 160px;
        height: 50px;
        justify-content: center;
        text-align: center;
        align-items: center;
        margin: 0%;
        padding: 0%;
        border-radius: 10px;
    }
    div {
        margin-left: 0%;
        padding: 0%;
    }
    /* 
    @media screen and (max-width: 574px) {
        .write {
            font-size: 20px;
        }
        .input {
            width: 55px;
        }
        #main {
            margin-top: 5%;
            margin-left: 0px;
            margin-right: 0px;
            padding: 0px;
        }
        div {
            margin: 2%;
        }
    }

    @media screen and (min-width: 575px) {
        .write {
            font-size: 30px;
        }
        .input {
            width: 90px;
        }
        #main {
            margin-top: 5%;
        }
        div {
            margin: 1%;
        }
    }
    @media screen and (min-width: 860px) {
        .write {
            font-size: 28px;
        }
        .input {
            width: 100px;
        }
    }

    @media screen and (min-width: 1000px) {
        .write {
            font-size: 30px;
        }
        .input {
            width: 90px;
        }
        div {
            margin: 1%;
        }
        #main {
            margin: 0%;
            padding: 0%;
        }
    }
    @media screen and (min-width: 1200px) {
        .write {
            font-size: 35px;
        }

        .input {
            width: 120px;
        }
        div {
            margin: 1%;
        }
    }
    @media screen and (min-width: 1400px) {
        .write {
            font-size: 45px;
        }

        .input {
            width: 150px;
        }
        div {
            margin: 1%;
        }
    }

    @media screen and (min-width: 1600px) {
        .input {
            width: 200px;
        }
        .write {
            font-size: 55px;
        }
        #main {
            display: flex;
            flex-direction: row;
            justify-content: start;
            font-weight: bold;
            align-items: flex-start;
            height: 100%;
            margin: 0;
        }
    } */
</style>
