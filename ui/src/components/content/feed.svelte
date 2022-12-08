<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../routes/presanitize";
    import Bad from "../inputs/bad.svelte";
    import GoodFeed from "../inputs/goodFeed.svelte";
    import Missing from "../inputs/missing.svelte";
    import Rework from "../inputs/rework.svelte";
    import Cod from "./cod.svelte";
    import Footer from "./footer.svelte";
    import Status from "./status.svelte";
    let supervisorApi = `/api/v1/supervisor`;
    let supervisorStop = "api/v1/supervisorParada";
    let imageLoader = "/images/axonLoader.gif";
    let badFeed;
    let missingFeed;
    let reworkFeed;
    let urlS = `/api/v1/point`;
    let motivoUrl = `/api/v1/badFeedMotives`;
    let odfData = [];
    let dados = [];
    let showConfirm = false;
    let valorFeed;
    let value;
    let supervisor = "";
    let qtdPossivelProducao;
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
    let stopModal = false;
    let urlString = `/api/v1/odfData`;
    let balance;
    getOdfData();
    let superSuperMaqPar;

    const checkPostSuper = async (event) => {
    if (!superSuperMaqPar) {
      superSuperMaqPar = "";
    } else if (superSuperMaqPar) {
      if (superSuperMaqPar.length >= 6 && event.key === "Enter") {
        if (
          !superSuperMaqPar ||
          superSuperMaqPar === "0" ||
          superSuperMaqPar === "00" ||
          superSuperMaqPar === "000" ||
          superSuperMaqPar === "0000" ||
          superSuperMaqPar === "00000" ||
          superSuperMaqPar === "000000"
        ) {
          modalMessage = "Crachá inválido";
        } else {
          loader = true;
          modalMessage = ''
          doPostSuper();
        }
      }
    }
  };
  const doPostSuper = async () => {
    loader = true;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch(supervisorStop, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        superSuperMaqPar: !superSuperMaqPar ? "" : superSuperMaqPar,
      }),
    }).then((res) => res.json());
    console.log("linha 57 /barcode.svelte/", res)

    if (res.message === "maquina") {
        loader = true;
    doPost()    
      //location.reload();
      modalMessage = 'Apontamento Liberado'
    }
    if (res.message === "supervisor não encontrado") {
      modalMessage = "Supervisor não encontrado";
      superParada = false;
      showmodal = false;
    }

    if (res.message === "erro na parada de maquina") {
      modalMessage = "Erro na parada de máquina";
      showmodal = false;
      superParada = false;
    }
  };

    async function getOdfData() {
        const res = await fetch(urlString);
        odfData = await res.json();
        if (!odfData) {
            return (window.location.href = `/#/codigobarras`);
        } else if (
            odfData.message === "Esta tentando acessar algo que não pode" ||
            odfData.message === `codigo de apontamento: 7 = máquina parada` ||
            odfData.message === `codeApont 2 setup finalizado`
        ) {
            return (window.location.href = `/#/codigobarras`);
        } else if (
            odfData.message === "codeApont 3 prod Ini." ||
            odfData.message === "Tudo certo por aqui /OdfData.ts/"
        ) {
            loader = false;
            qtdPossivelProducao = odfData.odfSelecionada.QTDE_LIB;
            if (qtdPossivelProducao <= 0) {
                qtdPossivelProducao = 0;
            }
        } else if (
            odfData.message === "codeApont 5 inicio de rip" ||
            odfData.message === "codeApont 4 prod finalzado"
        ) {
            return (window.location.href = `/#/rip`);
        } else {
            modalMessage = "Algo deu errado";
        }
    }

    async function getRefugodata() {
        const res = await fetch(motivoUrl);
        dados = await res.json();
    }

    async function checkForSuper(event) {
        if (supervisor.length >= 6 && event.key === "Enter") {
            if (supervisor === "000000") {
                modalMessage = "Crachá inválido";
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
    }

    const doPost = async () => {
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

        if (res.message === "Machine stopped") {
            loader = false;
            modalMessage = "Machine stopped";
        }

        if (res.message === "Jumping steps") {
            window.location.href = `/#/codigobarras`;
            location.reload();
        }

        if (res.message === "Already pointed") {
            loader = false;
            modalMessage = "Already pointed";
        }

        if (res.message === "Saldo menor que o apontado") {
            modalMessage = "Saldo menor que o apontado";
            balance = res.balance;
            loader = false;
        }
        if (res.message === "Algo deu errado") {
            location.reload();
        }

        if (res.message === "Supervisor inválido") {
            modalMessage = "Supervisor inválido";
            loader = false;
        }
        if (res.message === "supervisor não encontrado") {
            modalMessage = "Supervisor não encontrado";
            loader = false;
        }
        if (res.message === "Quantidade inválida") {
            modalMessage = "Quantidade inválida";
            loader = false;
        }
        if (res.message === "Código máquina inválido") {
            modalMessage = "Número operação inválido";
            loader = false;
        }
        if (res.message === "Código de peça inválido") {
            modalMessage = "Código de peça inválido";
            loader = false;
        }

        if (res.message === "Número operação inválido") {
            modalMessage = "Número operação inválido";
            loader = false;
        }

        if (res.message === "Número odf inválido") {
            modalMessage = "Número ODF inválido";
            loader = false;
        }
        if (res.message === "Funcionário Inválido") {
            modalMessage = "Funcionário Inválido";
            loader = false;
        }
        if (res.message === "Quantidade excedida") {
            modalMessage = "Quantidade excedida";
            loader = false;
        }
        if (res.message === "Quantidade inválida") {
            modalMessage = "Quantidade inválida";
            loader = false;
        }
        if (res.message === "Erro ao apontar") {
            modalMessage = "Erro ao apontar";
            loader = false;
        }
        if (res.message === "Sucesso ao apontar") {
            getSpaceFunc();
            modalMessage = "";
            showConfirm = false;
        }
    };

    async function getSpaceFunc() {
        const res = await fetch(urlS);
        getSpace = await res.json();
        if (getSpace.message === "No address") {
            loader = false;
            window.location.href = `${getSpace.url}`;
        }

        if (getSpace.message === "Address located") {
            loader = false;
            showAddress = true;
        }

        if (getSpace.message === "Error on locating space") {
            loader = false;
            window.location.href = `${getSpace.url}`;
            location.reload();
        }
    }

    async function doCallPost() {
        let numberBadFeed = Number(badFeed || 0);
        let numberGoodFeed = Number(valorFeed || 0);
        let numberQtdAllowed = Number(qtdPossivelProducao);
        let numberMissing = Number(missingFeed || 0);
        let numberReworkFeed = Number(reworkFeed || 0);

        if (
            numberMissing > 0 &&
            numberBadFeed + numberGoodFeed + numberReworkFeed === 0
        ) {
            return (modalMessage =
                "Não é possível apontar apenas quantidade de peças faltantes");
        } else if (
            numberReworkFeed > 0 &&
            numberBadFeed + numberGoodFeed + numberMissing === 0
        ) {
            return (modalMessage =
                "Apontando apenas peças retrabalhadas, confirma ?");
        } else if (
            numberReworkFeed > 0 &&
            numberMissing > 0 &&
            numberBadFeed + numberGoodFeed === 0
        ) {
            return (modalMessage =
                "Apontando apenas peças retrabalhadas e peças faltantes, confirma ?");
        } else if (
            (numberMissing > 0 &&
                numberGoodFeed > 0 &&
                numberGoodFeed < numberQtdAllowed &&
                numberBadFeed + numberReworkFeed === 0) ||
            (numberReworkFeed > 0 &&
                numberGoodFeed > 0 &&
                numberGoodFeed < numberQtdAllowed &&
                numberBadFeed + numberMissing === 0)
        ) {
            return (modalMessage = "Apontamento parcial");
        }

        let total =
            numberBadFeed + numberGoodFeed + numberMissing + numberReworkFeed;

        if (total > numberQtdAllowed) {
            modalMessage = "Quantidade excedida";
        }

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
        }

        if (
            numberBadFeed + numberMissing + numberReworkFeed === 0 &&
            numberGoodFeed === numberQtdAllowed
        ) {
            loader = true;
            doPost();
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
        loader = true;
        modalMessage = "";
        showAddress = false;
        window.location.href = `/#/rip`;
    }
    
    function handleSS(event) {
        valorFeed = event.detail.goodFeed;
    }

    function handll(event) {
        badFeed = event.detail.badFeed;
    }

    function hand(event) {
        missingFeed = event.detail.missingFeed;
    }

    function handllaa(event) {
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
                    <GoodFeed tabindex="1" autofocus on:message={handleSS} />
                </div>
                <div class="feed-area-div">
                    <Bad tabindex="2" on:message={handll} />
                </div>
                <div class="feed-area-div">
                    <Missing tabindex="3" on:message={hand} />
                </div>
                <div class="feed-area-div">
                    <Rework tabindex="4" on:message={handllaa} />
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
                        <h3>Apontamento com refugo</h3>
                    </div>
                    <select bind:value name="id" id="id">
                        {#each dados as item}
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

    {#if modalMessage === "Apontamento parcial"}
        <div class="fundo">
            <div class="header">
                <div class="content-area">
                    <div class="modalTitle">
                        <h3>{modalMessage}</h3>
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

    {#if modalMessage === "Apontando apenas peças retrabalhadas, confirma ?"}
        <div class="fundo">
            <div class="header">
                <div class="content-area">
                    <div class="modalTitle">
                        <h3>{modalMessage}</h3>
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

    {#if modalMessage === "Apontando apenas peças retrabalhadas e peças faltantes, confirma ?"}
        <div class="fundo">
            <div class="header">
                <div class="content-area">
                    <div class="modalTitle">
                        <h3>{modalMessage}</h3>
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
  
    {#if  modalMessage === 'Apontamento Liberado'}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>
                        {modalMessage}
                    </h2>
                </div>
                <button on:click={close} on:keypress={close}>Fechar</button>
            </div>
        </div>
    {/if}
    {#if modalMessage === "Machine stopped"}
        <div class="fundo">
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
                            on:keypress={checkPostSuper}
                            onkeyup="this.value = this.value.toUpperCase()"
                            bind:value={superSuperMaqPar}
                        />
                    </div>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Already pointed"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>
                        ODF apontada, finalize o processo para poder apontar
                        novamente
                    </h2>
                </div>
                <button on:click={close} on:keypress={close}>Fechar</button>
                <button on:keypress={closeRedirect} on:click={closeRedirect}
                    >Continuar</button
                >
            </div>
        </div>
    {/if}

    {#if modalMessage === "Não é possível apontar apenas quantidade de peças faltantes"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
            </div>
        </div>
    {/if}

    {#if modalMessage === "Saldo menor que o apontado"}
        <div class="fundo">
            <div class="header">
                <div class="closed">
                    <h2>{modalMessage}</h2>
                    <h4>Dispónivel para apontameto: {balance}</h4>
                </div>
                <button on:keypress={close} on:click={close}>fechar</button>
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
                    <h2>
                        Insira a quantidade no local : {getSpace.address}
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
    /* .modalContent {
        margin-left: 25px;
        margin-top: 0%;
        margin-bottom: 0%;
        margin-right: 0%;
    } */
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
