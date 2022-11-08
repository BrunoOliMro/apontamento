<script>
    // @ts-nocheck
    let imageLoader = "/images/axonLoader.gif";
    let badFeed;
    let missingFeed;
    let reworkFeed;
    let urlS = `/api/v1/apontar`;
    let urlString = `/api/v1/odfQtd`;
    let motivoUrl = `/api/v1/motivorefugo`;
    let dadosOdf = [];
    let dados = [];
    let showConfirm = false;
    let valorFeed;
    let value;
    let supervisor;
    let qtdPossivelProducao;
    let showError = false;
    let resultRefugo;
    let resultado = getOdfData();
    let showParcialSuper = false;
    let showParcialAndRef = false;
    let showSuperNotFound = false;
    let showErrorMessage = false;
    let showRoundedApont = false;
    resultRefugo = getRefugodata();
    let getSpace;
    var showAddress = false;
    let loader = false;
    let crachModal = ''

    async function getRefugodata() {
        const res = await fetch(motivoUrl);
        dados = await res.json();
        //console.log('dados linha feed', dados);
        //localStorage.setItem('dados', dados);
        // if (localStorage.dados === '' || localStorage.dados === undefined || localStorage.dados === null ) {
        //     console.log('linha 31 vazio');
        // }
    }

    async function getOdfData() {
        const res = await fetch(urlString);
        dadosOdf = await res.json();
        //console.log('linha 41', dadosOdf);
        qtdPossivelProducao = dadosOdf.valorMaxdeProducao;
        if (qtdPossivelProducao <= 0) {
            qtdPossivelProducao = 0;
        }
    }

    /**
     * @param {{ target: { value: any; }; }} e
     */
    function blockForbiddenChars(e) {
        let value = e.target.value;
        e.target.value = preSanitize(value);
    }

    /**
     * @param {string} input
     */
    function preSanitize(input) {
        const allowedChars = /[0-9]/;
        const sanitizedOutput = input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
        return sanitizedOutput;
    }

    function checkForSuper(event) {
        if (supervisor.length >= 6 && event.key === "Enter") {
            if (supervisor === "000000") {
                crachModal = "cracha invalido";
            }
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
                supervisor: supervisor,
            }),
        }).then((res) => res.json());

        console.log("res:", res);

        if (res.message === "supervisor não encontrado") {
            showSuperNotFound = true;
        }
        // if (res.message === "erro ao enviar o apontamento") {
        //     showErrorMessage = true;
        // }
        // if (res.message === 'valor apontado excede o valor do sistema') {
        //     showError = true;
        // }
        if (res.message === "valores apontados com sucesso") {
            window.location.href = `/#/rip`;
            //getSpaceFunc();
        }
        if (res.message === "valor apontado maior que a quantidade liberada") {
            showError = true;
            showConfirm = false;
        }
    };

    // async function getSpaceFunc() {
    //     const res = await fetch(urlS);
    //     getSpace = await res.json();
    //     //console.log('dados 100', getSpace);
    //     if (
    //         getSpace.message === "sem endereço" ||
    //         getSpace.address === undefined
    //     ) {
    //         window.location.href = `/#/rip`;
    //     } else if (getSpace.String === "endereço com sucesso") {
    //         showAddress = true;
    //     }
    // }

    async function doCallPost() {
        let numberBadFeed = Number(badFeed || 0);
        let numberGoodFeed = Number(valorFeed || 0);
        let numberQtdAllowed = Number(qtdPossivelProducao);
        let numberMissing = Number(missingFeed || 0);
        let numberReworkFeed = Number(reworkFeed || 0);
        // console.log("linha 122", numberBadFeed );
        // console.log("ba 117", numberGoodFeed);
        // console.log("mi 117", numberMissing);
        // console.log("re 118", numberReworkFeed);

        let total =
            numberBadFeed + numberGoodFeed + numberMissing + numberReworkFeed;
        // console.log("re 118", total);

        if (numberBadFeed > 0 && total <= numberQtdAllowed) {
            showConfirm = true;
        }
        if (total === 0) {
            showRoundedApont = true;
        }

        if (
            numberBadFeed + numberMissing + numberReworkFeed === 0 &&
            numberGoodFeed > 0 &&
            numberGoodFeed < numberQtdAllowed
        ) {
            showParcialSuper = true;
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

        // if (numberBadFeed > 0 && numberBadFeed <= numberQtdAllowed) {
        //     showConfirm = true;
        // }
        // if (badFeed === undefined) {
        //     badFeed = '';
        // }
        // if (typeof valorFeed) {
        //     console.log('valor feed post', typeof valorFeed);
        //     valorFeed = 0;
        // }
        // if(numberGoodFeed > numberQtdAllowed || numberBadFeed > numberQtdAllowed || missingFeed > numberQtdAllowed || reworkFeed > numberQtdAllowed){
        //     showError = true
        // }

        // if(numberBadFeed + numberGoodFeed + missingFeed + reworkFeed> numberQtdAllowed){
        //     showError = true
        // }

        // if (numberGoodFeed + numberBadFeed + missingFeed + reworkFeed <= numberQtdAllowed) {
        //     showConfirm = true
        // }
        // // doPost();

        // if (numberGoodFeed > 0 && numberGoodFeed + missingFeed + reworkFeed + badFeed <= numberQtdAllowed && numberBadFeed === 0) {
        //     showParcialSuper = true;
        // }

        // if (numberBadFeed > 0 && numberGoodFeed === 0) {
        //     showConfirm = true;
        // }

        // if (numberBadFeed > 0 && numberGoodFeed > 0) {
        //     showParcialAndRef = true;
        // }

        // if ((numberGoodFeed === 0 && numberBadFeed === 0) || numberGoodFeed + numberBadFeed === 0) {
        //     showRoundedApont = true;
        // }
    }

    function close() {
        showError = false;
        showConfirm = false;
        showParcialSuper = false;
        showSuperNotFound = false;
        showRoundedApont = false;
        showErrorMessage = false;
        showAddress = false;
    }

    function closeRedirect() {
        showAddress = false;
        window.location.href = `/#/rip`;
    }
</script>

{#if loader === true}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{/if}

{#await resultado}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then itens}
    {#if dadosOdf.length !== 0}
        <main class="main">
            <div class="fullForm">
                <form action="/api/v1/apontar" method="POST" class="form">
                    <div id="prod" class="write">
                        <p>PRODUZIR</p>
                        <div>
                            {qtdPossivelProducao}
                        </div>
                    </div>
                    <div class="write" id="feed">
                        <p>BOAS</p>
                        <input
                            tabindex="1"
                            autofocus
                            class="input"
                            id="valorFeed"
                            bind:value={valorFeed}
                            on:input={blockForbiddenChars}
                            name="valorFeed"
                        />
                    </div>
                    <div class="write" id="ruins" name="ruins">
                        <p>RUINS</p>
                        <input
                            tabindex="2"
                            autofocus
                            bind:value={badFeed}
                            on:input={blockForbiddenChars}
                            class="input"
                            id="badFeed"
                            name="badFeed"
                        />
                    </div>
                    <div class="write" id="retrabalhar">
                        <p>RETRABALHAR</p>
                        <input
                            autofocus
                            bind:value={reworkFeed}
                            on:input={blockForbiddenChars}
                            class="input"
                            id="reworkFeed"
                            type="text"
                            name="reworkFeed"
                        />
                    </div>
                    <div class="write" id="faltante">
                        <p>FALTANTE</p>
                        <input
                            autofocus
                            bind:value={missingFeed}
                            on:input={blockForbiddenChars}
                            class="input"
                            id="missingFeed"
                            type="text"
                            name="missingFeed"
                        />
                    </div>
                </form>

                <a
                    tabindex="3"
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
                                <h2>APONTAMENTO COM REFUGO</h2>
                            </div>
                            <select bind:value name="id" id="id">
                                {#each dados as item}
                                    <option>{item}</option>
                                {/each}
                            </select>
                            <p>Supervisor</p>
                            <input
                                autofocus
                                on:keypress={checkForSuper}
                                bind:value={supervisor}
                                class="supervisor"
                                on:input={blockForbiddenChars}
                                type="text"
                                name="supervisor"
                                id="supervisor"
                            />
                            <!-- <button
                                on:keypress={checkForSuper}
                                on:click={checkForSuper}>Confirmar</button
                            > -->
                            <button on:keypress={close} on:click={close}
                                >Fechar</button
                            >
                        </div>
                    </div>
                {/if}
            {/await}

            {#if showParcialSuper === true}
                <div class="fundo">
                    <div class="header">
                        <div class="closed">
                            <h2>APONTAMENTO PARCIAL</h2>
                        </div>
                        <p>Supervisor</p>
                        <input
                            autofocus
                            bind:value={supervisor}
                            on:keypress={checkForSuper}
                            on:input={blockForbiddenChars}
                            class="supervisor"
                            type="text"
                            name="supervisor"
                            id="supervisor"
                        />
                        <!-- <button on:keypress={doPost} on:click={doPost}
                            >Confirmar</button
                        > -->
                        <button on:keypress={close} on:click={close}
                            >Fechar</button
                        >
                    </div>
                </div>
            {/if}

            <!-- {#if showParcialAndRef === true}
                <div class="fundo">
                    <div class="header">
                        <div class="closed">
                            <h2>Este lançamento é uma Parcial e há Refugo</h2>
                        </div>
                        <p>Supervisor</p>
                        <input
                            autofocus
                            bind:value={supervisor}
                            on:input={blockForbiddenChars}
                            class="supervisor"
                            type="text"
                            name="supervisor"
                            id="supervisor"
                        />
                        <button on:keypress={doPost} on:click={doPost}
                            >Confirmar</button
                        >
                    </div>
                </div>
            {/if} -->

            <!-- {#if showParcialSuper === true}
                <div class="fundo">
                    <div class="header">
                        <div class="closed">
                            <h2>Envio Parcial</h2>
                        </div>
                        <p>Supervisor</p>
                        <input
                            autofocus
                            bind:value={supervisor}
                            on:input={blockForbiddenChars}
                            class="supervisor"
                            type="text"
                            name="supervisor"
                            id="supervisor"
                        />
                        <button on:click={doPost} on:keypress={doPost}
                            >Confirmar</button
                        >
                        <button on:click={close} on:keypress={close}
                            >Fechar</button
                        >
                    </div>
                </div>
            {/if} -->

            {#if showError === true}
                <div class="fundo">
                    <div class="header">
                        <div class="closed">
                            <h2>Valor Enviado maior que o possivel</h2>
                        </div>
                        <button on:keypress={close} on:click={close}
                            >fechar</button
                        >
                    </div>
                </div>
            {/if}

            {#if crachModal === 'cracha invalido'}
                <div class="fundo">
                    <div class="header">
                        <div class="closed">
                            <h2>Supervisor inválido</h2>
                        </div>
                        <button on:keypress={close} on:click={close}
                            >fechar</button
                        >
                    </div>
                </div>
            {/if}


            {#if showErrorMessage === true}
                <div class="fundo">
                    <div class="header">
                        <div class="closed">
                            <h2>Erro ao enviar apontamento</h2>
                        </div>
                        <button on:keypress={close} on:click={close}
                            >fechar</button
                        >
                    </div>
                </div>
            {/if}

            {#if showRoundedApont === true}
                <div class="fundo">
                    <div class="header">
                        <div class="closed">
                            <h2>Apontamento com valores Invalidos</h2>
                        </div>
                        <button on:keypress={close} on:click={close}
                            >fechar</button
                        >
                    </div>
                </div>
            {/if}

            {#if showSuperNotFound === true}
                <div class="fundo">
                    <div class="header">
                        <div class="closed">
                            <h2>Supervisor não encontrado</h2>
                        </div>
                        <button
                            tabindex="7"
                            on:keypress={close}
                            on:click={close}>fechar</button
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
                        <button
                            on:keypress={closeRedirect}
                            on:click={closeRedirect}>fechar</button
                        >
                    </div>
                </div>
            {/if}
        </main>
    {/if}
{/await}

<style>
    #apontar {
        z-index: 1;
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
    .fullForm {
        margin: 0%;
        padding: 0%;
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
        border-radius: 5px;
        background-color: black;
        z-index: 1;
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

    .main {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin-left: 10%;
    }
    .write {
        margin: 0%;
        /* padding: 0px 30px; */
        font-size: 44px;
    }
    #prod,
    #feed {
        padding: 0px 60px 0px 0px;
    }

    input {
        border-color: grey;
        border-radius: 8px;
        width: 100%;
    }
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
    /* #parcialDiv {
        display: none;
    } */
    main {
        justify-content: center;
        display: flex;
        font-weight: bold;
        letter-spacing: 1px;
    }
    p {
        margin: 1%;
        padding: 0%;
    }

    input {
        width: 130px;
        height: 50px;
        margin: 0%;
        padding: 0%;
    }

    form {
        display: flex;
    }

    #retrabalhar {
        display: none;
    }

    #faltante {
        display: none;
    }
    div {
        margin-left: 8%;
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
