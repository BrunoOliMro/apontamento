<script>
    // @ts-nocheck
    // import ModalConfirmation from "../modal/modalConfirmation.svelte";
    // import blockForbiddenChars from "../../utils/presanitize";
    import messageQuery from "../../utils/checkMessage";
    import GoodFeed from "../inputs/goodFeed.svelte";
    import { createEventDispatcher } from "svelte";
    import Missing from "../inputs/missing.svelte";
    import Rework from "../inputs/rework.svelte";
    import Bad from "../inputs/bad.svelte";
    import Footer from "./footer.svelte";
    import Status from "./status.svelte";
    import Cod from "./cod.svelte";
    // import Supervisor from "./supervisor.svelte";
    // const imageLoader = "/images/axonLoader.gif";
    // let showConfirm = false;
    // let loader = false;
    // var address = messageQuery(0);
    // let message = messageQuery(0);
    // let subTitle = messageQuery(0);
    // let data = [];
    // var returnValueAddress;
    export let supervisor;
    export let pointString = "APONTAR";
    export let isRequesting = false;
    export let rip = false;
    export let badFeedMotive;
    export let missingFeed;
    export let reworkFeed;
    export let valorFeed;
    export let badFeed;
    export let odfData;
    // motives();
    const dispatch = createEventDispatcher();

    // async function motives() {
    //     const res = await fetch(urlBadFeedMotive);
    //     data = await res.json();
    // }

    async function callDispatch(event) {
        if (
            event.detail.text === "Check for super" ||
            event.detail.text === "Send" ||
            event.key === "Enter" ||
            event.type === "click"
        ) {
            dispatch("message", {
                eventType: event,
                text: "Send",
                badFeed: badFeed,
                missingFeed: missingFeed,
                reworkFeed: reworkFeed,
                valorFeed: valorFeed,
                value: badFeedMotive,
                supervisor: supervisor,
            });
        }
    }

    // async function checkStopMachine(event) {
    //     const res = await verifyStringLenght(
    //         event.detail.eventType,
    //         supervisor,
    //         6,
    //         14
    //     );
    //     if (res === messageQuery(1)) {
    //         postStop();
    //     }
    // }

    // const postStop = async (event) => {
    //     loader = true;
    //     const res = await post(supervisorStop, { supervisor });
    //     if (res) {
    //         if (res.message === messageQuery(1)) {
    //             callDispatch(event);
    //         } else if (res.message !== messageQuery(0)) {
    //             loader = false;
    //         }
    //     }
    // };

    // async function checkForSuper(event) {
    //     const result = await verifyStringLenght(event, supervisor, 6, 14);
    //     if (result === messageQuery(1)) {
    //         callDispatch(event);
    //     }
    // }

    // function checkPost(event) {
    //     isRequesting = true;
    //     const numberQtdAllowed = Number(odfData.codData.data.QTDE_LIB || 0);
    //     const numberBadFeed = Number(badFeed || 0);
    //     const numberGoodFeed = Number(valorFeed || 0);
    //     const numberMissing = Number(missingFeed || 0);
    //     const numberReworkFeed = Number(reworkFeed || 0);
    //     const total =
    //         numberBadFeed + numberGoodFeed + numberMissing + numberReworkFeed;

    //     try {
    //         if (
    //             numberMissing > 0 &&
    //             numberBadFeed + numberGoodFeed + numberReworkFeed === 0
    //         ) {
    //             return (message = messageQuery(48));
    //         } else if (
    //             numberReworkFeed > 0 &&
    //             numberBadFeed + numberGoodFeed + numberMissing === 0
    //         ) {
    //             return (message = messageQuery(49));
    //         } else if (
    //             numberReworkFeed > 0 &&
    //             numberMissing > 0 &&
    //             numberBadFeed + numberGoodFeed === 0
    //         ) {
    //             return (message = messageQuery(50));
    //         } else if (
    //             (numberMissing > 0 &&
    //                 numberGoodFeed > 0 &&
    //                 numberGoodFeed < numberQtdAllowed &&
    //                 numberBadFeed + numberReworkFeed === 0) ||
    //             (numberReworkFeed > 0 &&
    //                 numberGoodFeed > 0 &&
    //                 numberGoodFeed < numberQtdAllowed &&
    //                 numberBadFeed + numberMissing === 0) ||
    //             (numberGoodFeed > 0 &&
    //                 numberMissing > 0 &&
    //                 numberReworkFeed > 0 &&
    //                 numberBadFeed <= 0) ||
    //             (numberBadFeed + numberMissing + numberReworkFeed === 0 &&
    //                 numberGoodFeed > 0 &&
    //                 numberGoodFeed < numberQtdAllowed)
    //         ) {
    //             return (message = messageQuery(46));
    //         } else if (total > numberQtdAllowed) {
    //             message = messageQuery(47);
    //         } else if (numberBadFeed > 0 && total <= numberQtdAllowed) {
    //             showConfirm = true;
    //         } else if (total === 0) {
    //             message = messageQuery(45);
    //         } else if (
    //             numberBadFeed + numberMissing + numberReworkFeed === 0 &&
    //             numberGoodFeed === numberQtdAllowed
    //         ) {
    //             callDispatch(event);
    //         }
    //     } catch (error) {
    //         return (message = messageQuery(4));
    //     } finally {
    //         isRequesting = false;
    //     }
    // }

    // function close() {
    //     address = messageQuery(0);
    //     message = messageQuery(0);
    //     showConfirm = false;
    // }

    // function closeRedirect() {
    //     loader = true;
    //     message = messageQuery(0);
    //     address = false;
    //     window.location.href = messageQuery(18);
    // }

    
    if (!odfData.codData.data) {
        odfData.codData.data = "S/I";
    } 

    if (odfData.codData.code === messageQuery(10) || rip === true) {
        pointString = "RIP";
        rip = true;
    }
</script>

<!-- {#if loader === true}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{/if} -->

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
                    bind:goodFeed={valorFeed}
                    on:message={callDispatch}
                />
            </div>
            <div class="feed-area-div">
                <Bad
                    tabindex="2"
                    bind:valueOfBadFeed={badFeed}
                    on:message={callDispatch}
                />
            </div>
            <div class="feed-area-div">
                <Missing tabindex="3" bind:missingFeed on:message={callDispatch} />
            </div>
            <div class="feed-area-div">
                <Rework tabindex="4" bind:reworkFeed on:message={callDispatch} />
            </div>
        </div>
        {#if pointString === "APONTAR"}
            <div class="buttonApontar">
                <!-- svelte-ignore a11y-positive-tabindex -->
                <a
                    disabled={isRequesting === true}
                    tabindex="5"
                    id="apontar"
                    on:keypress|preventDefault={callDispatch}
                    on:click|preventDefault={callDispatch}
                    type="submit"
                >
                    <span />
                    <span />
                    <span />
                    <span />
                    {pointString}
                </a>
            </div>
        {/if}

        {#if pointString !== "APONTAR"}
            <div class="buttonApontar">
                <!-- svelte-ignore a11y-positive-tabindex -->
                <a
                    disabled={isRequesting === true}
                    tabindex="5"
                    id="apontar"
                    on:keypress|preventDefault={callDispatch}
                    on:click|preventDefault={callDispatch}
                    type="submit"
                >
                    <span />
                    <span />
                    <span />
                    <span />
                    {pointString}
                </a>
            </div>
        {/if}
    </div>
</div>

    <!-- {#if showConfirm === true}
        <div class="background">
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
        </div>
    {/if} -->

<!-- {#if message === messageQuery(46)}
    <Supervisor
        titleSupervisor={message}
        {subTitle}
        bind:supervisor
        on:message={callDispatch}
    />
{/if}

{#if message === "Apontando apenas peças retrabalhadas, confirma ?" || message === "Apontar apenas faltantes, confirma?" || message === "Apontando apenas peças retrabalhadas e peças faltantes, confirma ?"}
    <Supervisor
        titleSupervisor={message}
        {subTitle}
        bind:supervisor
        on:message={checkForSuper}
    />
{/if}

{#if message === "Máquina parada"}
    <Supervisor
        titleSupervisor={message}
        {subTitle}
        bind:supervisor
        on:message={checkStopMachine}
    />
{/if}

{#if message === "Already pointed"}
    <div class="background">
        <div class="header">
            <div class="closed">
                <h2>ODF apontada, finalize o processo.</h2>
            </div>
            <button on:click={close} on:keypress={close}>Fechar</button>
            <button on:keypress={closeRedirect} on:click={closeRedirect}
                >Continuar</button
            >
        </div>
    </div>
{/if}

{#if message && message !== messageQuery(0) && message !== messageQuery(46) && message !== "Máquina parada" && message !== messageQuery(44)}
    <ModalConfirmation
        on:message={close}
        {message}
        title={message}
        on:message={close}
    />
{/if}

{#if message === messageQuery(44) && returnValueAddress}
    <div class="background">
        <div class="header">
            <div class="closed">
                <h2>
                    Devolva a quantidade restante no : {returnValueAddress}
                </h2>
            </div>
            <button on:keypress={closeRedirect} on:click={closeRedirect}
                >Continuar</button
            >
        </div>
    </div>
{/if}

{#if address && address !== messageQuery(0)}
    <div class="background">
        <div class="header">
            <div class="closed">
                <h2>
                    Insira a quantidade apontada no : {address}
                </h2>
            </div>
            <button on:keypress={closeRedirect} on:click={closeRedirect}
                >Continuar</button
            >
        </div>
    </div>
{/if} -->

<style>
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
    /* .loader {
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
    } */

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
    /* button {
        display: flex;
        justify-content: right;
        text-align: right;
        align-items: right;
        border: none;
        background-color: transparent;
        color: white;
    } */

    /* .loader {
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
    } */
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

    /* .modalFooter {
        margin: 0%;
        padding: 0%;
        display: flex;
        flex-direction: row;
        align-items: right;
        text-align: right;
        justify-content: right;
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
    } */

    /* .background {
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
    } */
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
