<script>
    // @ts-nocheck
    import Sanitize from "../../routes/sanitize.svelte";
    // import DrawingButton from "../buttons/drawingButton.svelte";
    // import HistoricButton from "../buttons/historicButton.svelte";
    // import MissingButton from "../buttons/missingButton.svelte";
    // import ReworkButton from "../buttons/reworkButton.svelte";
    // import StopButton from "../buttons/stopButton.svelte";
    import Bad from "../inputs/bad.svelte";
    import GoodFeed from "../inputs/goodFeed.svelte";
    import Missing from "../inputs/missing.svelte";
    import Rework from "../inputs/rework.svelte";
    import ModalConfirmation from "../modal/modalConfirmation.svelte";
    import Cod from "./cod.svelte";
    import Footer from "./footer.svelte";
    import Status from "./status.svelte";

    let supervisorApi = `/api/v1/supervisor`;
    let imageLoader = "/images/axonLoader.gif";
    let badFeed;
    let missingFeed;
    let reworkFeed;
    let urlS = `/api/v1/apontar`;
    let motivoUrl = `/api/v1/motivorefugo`;
    let dadosOdf = [];
    let dados = [];
    let showConfirm = false;
    let valorFeed;
    let value;
    let supervisor;
    //let qtdPossivelProducao;
    let showError = false;
    let showParcialSuper = false;
    let showSuperNotFound = false;
    let showErrorMessage = false;
    let showRoundedApont = false;
    let resultRefugo = getRefugodata();
    let getSpace;
    var showAddress = false;
    let loader = false;
    let modalMessage = "";
    // let rework = false;
    // let missing = false;
    let stopModal = false;
    // let bad = true;
    let showMaqPar = false;
    let modalTitle = "Máquina Parada ";

    function closePop() {
        showMaqPar = false;
        if (stopModal === false) {
            stopModal = true;
        } else {
            stopModal = false;
        }
    }

    function closeConfirm() {
        showMaqPar = false;
        stopModal = false;
        window.location.href = `/#/codigobarras`;
    }

    async function getRefugodata() {
        const res = await fetch(motivoUrl);
        dados = await res.json();
        console.log("linha 67", dados.length);
    }

    async function checkForSuper(event) {
        if (supervisor.length >= 5 && event.key === "Enter") {
            if (supervisor === "000000") {
                modalMessage = "Crachá inválido";
            }
        }
        const headers = new Headers();
        const res = await fetch(supervisorApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                supervisor: supervisor,
            }),
        }).then((res) => res.json());
        if (res.message === "Supervisor encontrado") {
            doPost();
        }
    }

    const doPost = async () => {
        //console.log("linha 78", supervisor);
        loader = true;
        const headers = new Headers();
        const res = await fetch(urlS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                valorFeed: valorFeed,
                badFeed: badFeed,
                missingFeed: missingFeed,
                reworkFeed: reworkFeed,
                value: value,
            }),
        }).then((res) => res.json());

        console.log("res:", res);

        if (res.message === "Supervisor inválido") {
            modalMessage = "Supervisor inválido";
        }
        if (res.message === "supervisor não encontrado") {
            modalMessage = "Supervisor não encontrado";
            //showSuperNotFound = true;
        }
        if (res.message === "Quantidade inválida") {
            modalMessage = "Quantidade inválida";
        }
        if (res.message === "Código máquina inválido") {
            modalMessage = "Número operação inválido";
            //showSuperNotFound = true;
        }
        if (res.message === "Código de peça inválido") {
            modalMessage = "Código de peça inválido";
        }

        if (res.message === "Número operação inválido") {
            modalMessage = "Número operação inválido";
        }

        if (res.message === "Número odf inválido") {
            modalMessage = "Número ODF inválido";
        }
        if (res.message === "Funcionário Inválido") {
            modalMessage = "Funcionário Inválido";
        }
        if (res.message === "Quantidade excedida") {
            modalMessage = "Quantidade excedida";
        }
        if (res.message === "Quantidade inválida") {
            modalMessage = "Quantidade inválida";
        }
        if (res.message === "Erro ao apontar") {
            modalMessage = "Erro ao apontar";
        }
        if (res.message === "Sucesso ao apontar") {
            loader = true;
            window.location.href = `/#/rip`;
            modalMessage = "";
            showConfirm = false;
        }
    };

    async function getSpaceFunc() {
        const res = await fetch(urlS);
        getSpace = await res.json();

        if (
            getSpace.message === "sem endereço" ||
            getSpace.address === undefined
        ) {
            window.location.href = `/#/rip`;
        } else if (getSpace.String === "endereço com sucesso") {
            showAddress = true;
        }
    }

    async function doCallPost() {
        let numberBadFeed = Number(badFeed || 0);
        let numberGoodFeed = Number(valorFeed || 0);
        //let numberQtdAllowed = Number(qtdPossivelProducao);
        let numberMissing = Number(missingFeed || 0);
        let numberReworkFeed = Number(reworkFeed || 0);

        let total =
            numberBadFeed + numberGoodFeed + numberMissing + numberReworkFeed;
        // console.log("re 118", total);

        if (numberBadFeed > 0 && total <= numberQtdAllowed) {
            showConfirm = true;
        }
        if (total === 0) {
            modalMessage = "Apontamento vazio";
        }

        if (
            numberBadFeed + numberMissing + numberReworkFeed === 0 &&
            numberGoodFeed > 0 &&
            numberGoodFeed < numberQtdAllowed
        ) {
            modalMessage = "Apontamento parcial";
            //showParcialSuper = true;
        }

        if (
            numberBadFeed + numberMissing + numberReworkFeed === 0 &&
            numberGoodFeed === numberQtdAllowed
        ) {
            doPost();
            loader = true;
        }

        if (total > numberQtdAllowed) {
            showError = true;
        }
    }

    function close() {
        showError = false;
        showConfirm = false;
        showParcialSuper = false;
        showSuperNotFound = false;
        showRoundedApont = false;
        showErrorMessage = false;
        showAddress = false;
        stopModal = false;
        modalMessage = "";
    }

    function closeRedirect() {
        modalMessage = "";
        showAddress = false;
        window.location.href = `/#/rip`;
    }

    const confirm = async () => {
        const headers = new Headers();
        const res = await fetch(postParada, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                value: value,
            }),
        }).then((res) => res.json());
        if (res.message === "maquina parada com sucesso") {
            showMaqPar = true;
            showmodal = false;
        }
    };

</script>

{#if loader === true}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{/if}

{#await dados.length !== 0}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then itens}
    <!-- {#if dadosOdf.length !== 0} -->
    <div class="content">
        <div class="status-area">
            <div><Status /></div>
            <div><Cod /></div>
        </div>
        <div class="feed-content">
            <div class="footer-area">
                <Footer />
            </div>
            <div class="feed-area">
                <div class="feed-area-div">
                    <GoodFeed bind:value={valorFeed} />
                </div>
                <div class="feed-area-div">
                    <Bad tabindex="2" bind:value={badFeed} />
                </div>
                <div class="feed-area-div">
                    <Missing tabindex="3" bind:value={missingFeed} />
                </div>
                <div class="feed-area-div">
                    <Rework tabindex="4" bind:value={reworkFeed} />
                </div>
            </div>
            <div class="buttonApontar">
                <a
                    tabindex="5"
                    id="apontar"
                    on:keypress={doCallPost}
                    on:click={doCallPost}
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
    {:then item}
        {#if showConfirm === true}
            <div class="fundo">
                <div class="header">
                    <div class="closed">
                        <h2>Apontamento com refugo</h2>
                    </div>
                    <select bind:value name="id" id="id">
                        {#each dados as item}
                            <option>{item}</option>
                        {/each}
                    </select>
                    <p>Supervisor</p>
                    <!-- on:input={Sanitize} -->
                    <input
                        autofocus
                        on:keypress={checkForSuper}
                        bind:value={supervisor}
                        class="supervisor"
                        type="text"
                        name="supervisor"
                        id="supervisor"
                    />
                    <!-- <button
                                on:keypress={checkForSuper}
                                on:click={checkForSuper}>Confirmar</button
                            > -->
                    <button on:keypress={close} on:click={close}>Fechar</button>
                </div>
            </div>
        {/if}
    {/await}

    {#if modalMessage === "Apontamento parcial"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <p>Supervisor</p>
                <input
                    autofocus
                    bind:value={supervisor}
                    on:keypress={checkForSuper}
                    on:input={Sanitize}
                    class="supervisor"
                    type="text"
                    name="supervisor"
                    id="supervisor"
                />
                <!-- <button on:keypress={doPost} on:click={doPost}
                            >Confirmar</button
                        > -->
                <button on:keypress={close} on:click={close}>Fechar</button>
            </div>
        </div>
    {/if}

    {#if showMaqPar === true}
        <ModalConfirmation title={modalTitle} on:message={closeConfirm} />
    {/if}

    {#if stopModal === true}
        <div class="modalBackground">
            <div class="itensInsideModal">
                <div class="closePopDiv">
                    <button
                        class="btnPop"
                        on:keypress={closePop}
                        on:click={closePop}>FECHAR</button
                    >
                </div>

                <div class="modalContent">
                    <h2 class="modalTitle">Motivo da Parada</h2>
                    <div class="optionsBar">
                        <select autofocus tabindex="10" bind:value>
                            {#each dados as item}
                                <option>{item}</option>
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
        </div>
    {/if}

    {#if modalMessage === "Quantidade excedida"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Funcionário Inválido"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Número ODF inválido"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Crachá inválido"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Erro ao apontar"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Supervisor inválido"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Número operação inválido"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Apontamento vazio"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Supervisor não encontrado"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button tabindex="7" on:keypress={close} on:click={close}
                    >fechar</button
                >
            </div>
        </div>
    {/if}

    {#if showAddress === true}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{getSpace.address}</h2>
                </div>
                <button on:keypress={closeRedirect} on:click={closeRedirect}
                    >fechar</button
                >
            </div>
        </div>
    {/if}
    <!-- {/if} -->
{/await}

<style>
    .footer-area {
        display: flex;
        width: 100%;
    }
    .feed-area {
        margin-top: 50px;
        display: grid;
        /* grid-template-areas: 'a', 'a', 'a', 'a'; */
        /* flex-direction: row; */
        /* justify-content: space-around; */
        /* align-items: center;
        text-align: center; */
        /* margin: 8%; */
        /* margin-left: 0%;
        margin-bottom: 0%;
        margin-top: 0%;
        padding: 0%;
        width: 100%; */
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
    /* .inputsBtn {
        display: flex;
        justify-content: left;
    } */
    /* .inputsFeed {
        display: grid;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    } */
    /* .inputChange {
        display: grid;
        justify-content: right;
        margin: 1%;
        padding: 0%;
    } */
    /* .changeInput {
        display: grid;
        flex-direction: column;
        justify-content: right;
        align-items: left;
        text-align: left;
        height: 100%;
    }  */
    .modalContent {
        margin-left: 25px;
        margin-top: 0%;
        margin-bottom: 0%;
        margin-right: 0%;
    }
    button {
        letter-spacing: 0.5px;
        width: 100%;
        height: 28px;
    }
    .optionsBar {
        margin-bottom: 10px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
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
    .closePopDiv {
        font-size: 12px;
        flex-direction: row;
        margin-right: 2%;
        margin-top: 0%;
        padding: 0%;
    }
    .confirmPopDiv {
        font-size: 16px;
        margin: 0%;
        padding: 0%;
        flex-direction: row;
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
    .btnPop {
        margin: 1%;
        padding: 0%;
        background-color: transparent;
        flex-direction: row;
        border-radius: 5px;
        opacity: 0.5;
        color: white;
        border: none;
    }

    .btnPopConfirm {
        margin: 1%;
        padding: 0%;
        background-color: transparent;
        flex-direction: row;
        align-items: left;
        text-align: left;
        justify-content: left;
        border-radius: 5px;
        opacity: 0.5;
        color: white;
        border: none;
    }

    .btnPopConfirm:hover {
        transition: 1s;
        opacity: 1;
    }

    .btnPop:hover {
        transition: 1s;
        opacity: 1;
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

    .modalBackground {
        transition: 1s;
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
        z-index: 999999999999999999999999999999;
    }
    .itensInsideModal {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 625px;
        height: 300px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
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

    /* .inputsFeed {
        margin: 0%;
        padding: 0%;
        display: flex;
        flex-direction: row;
        justify-content: center;
    } */
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
        background: black;
        color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 2.5px black, 0 0 12.5px black, 0 0 25px black,
            0 0 1px black;
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

    /* .write {
        margin: 0%;
        font-size: 52px;
        padding: 0%;
        height: fit-content;
        width: fit-content;
    }
    #feed-area {
        width: fit-content;
        height: fit-content;
        margin: 0%;
        padding: 0px 60px 0px 0px;
    } */

    /* input {
        border-color: grey;
        border-radius: 8px;
        width: 100%;
    } */
    .header {
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        width: 450px;
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 3px;
        z-index: 9;
    }

    .fundo {
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
        font-size: 65px;
        width: fit-content;
        height: fit-content;
        margin: 0%;
        padding: 0%;
    }

    input {
        width: 130px;
        height: 50px;
        margin: 0%;
        padding: 0%;
        border-radius: 8px;
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
