<script>
    // @ts-nocheck
    import post from "../utils/postFunction";
    import Message from "../components/components/message.svelte";
    import { verifyStringLenght } from "../utils/verifyLength";
    import RipTable from "../components/table/ripTable.svelte";
    import messageQuery from "../utils/checkMessage";
    import ModalConfirmation from "../components/modal/modalConfirmation.svelte";
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    import Supervisor from "../components/components/supervisor.svelte";
    const Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";
    const imageLoader = "/images/axonLoader.gif";
    const back = "/images/icons8-go-back-24.png";
    const supervisorRouter = `/api/v1/supervisor`;
    const pointRipRouter = `/api/v1/pointRip`;
    const titleBread = `Dados da ODF`;
    const ripRouter = `/api/v1/rip`;
    const final = `Finalizar`;
    const seq = "Seq";
    let isRequesting = false;
    let finish = false;
    let loader = false;
    let odf = false;
    let extraColumns = [];
    let ripTable = [];
    const setup = {};
    let values = {};
    let supervisor = messageQuery(0);
    let message = messageQuery(0);
    let lie;
    let lsd;
    const cookies = document.cookie;
    let messageObj = false;
    let result ;

        if(!cookies){
            message = messageQuery(38)
            messageObj = true
        } else {
            result = callRip()
        }

    async function callRip() {
        const res = await fetch(ripRouter);
        ripTable = await res.json();
        
        if (ripTable) {
            loader = false;

            if(ripTable.message === messageQuery(1) && ripTable.data.length > 0 && ripTable.code === messageQuery(11)){
                lie = ripTable.data.map((acc) => acc.LIE);
                return lsd = ripTable.data.map((acc) => acc.LSE);
            } 

            if(ripTable.message === messageQuery(1) && ripTable.code === messageQuery(12)){
                message = messageQuery(38)
                return messageObj = true
            }

            if(ripTable.data.length <= 0){
                return callPost()
            }
        } else {
            messageObj = true
            return (message = messageQuery(4));
        }
    }

    async function checkSuper(event) {
        const resultVerifySupervisor = await verifyStringLenght( event, supervisor, 6, 14);
        if (resultVerifySupervisor === messageQuery(1)) {
            const res = await post(supervisorRouter, supervisor);
            if (res) {
                return callPost();
            } else {
                return (message = messageQuery(25));
            }
        } else {
            return (message = messageQuery(26));
        }
    }

    const callPost = async () => {
        isRequesting = true;
        loader = true;
        const res = await post(pointRipRouter, setup);
        isRequesting = false;
        if (res) {
            console.log("call Post Rip", res.qtdelib);
            loader = false

            if(res.code === messageQuery(12) && res.qtdelib > 0 ){
                message = messageQuery(41)
                return messageObj = true
            } else if(res.code === messageQuery(12) && res.qtdelib <= 0) {
                message = messageQuery(38)
                return messageObj = true
            }

            if(res.code ===  messageQuery(12) ){
                message = messageQuery(38)
                messageObj = false
            }  
            else if( res.status === messageQuery(1) && res.message === messageQuery(1) &&  res.data === messageQuery(1) && res.code === messageQuery(33) ){
                message = messageQuery(38)
                messageObj = true
            }
        } else {
            message = messageQuery(4);
        }
    };

    function createCol() {
        const quantityReleased =
            Object.values(values).length -
            ripTable.data.length * extraColumns.length;

        if (quantityReleased - ripTable.data.length === 0) {
            if (extraColumns.length < 13) {
                extraColumns = [...extraColumns, extraColumns.length + 2];
            }
        } else {
            message = "Preencha tudo";
        }
    }

    const check = async () => {
        isRequesting = true;
        if (
            Object.values(values).length <= 0 ||
            Object.values(values).length < ripTable.data.length
        ) {
            return (message = messageQuery(23));
        }

        let copyOfExtraCol = extraColumns;
        let extraArrayCollumns = [];
        if (extraColumns.length === 1) {
            extraArrayCollumns.push(copyOfExtraCol + 1);
        }

        const quantityReleased =
            ripTable.data.length * extraArrayCollumns.length -
            Object.values(values).length;

        if (quantityReleased <= 0) {
            const rows = Object.keys(values).reduce((acc, iterator) => {
                // if (ripTable[i].LSE === null && ripTable[i].LIE === null) {
                //     ripTable[i].LSE = "OK";
                //     ripTable[i].LIE = "OK";
                // }
                const [col, lin] = iterator.split("-");
                if (acc[lin] === undefined) acc[lin] = {};
                acc[lin][col] = values[iterator];
                return acc;
            }, {});

            const callSupervisor = Object.values(rows).some((row) => {
                return Object.keys(row)
                    .filter((key) => key !== "LIE" && key !== "LSE")
                    .some((key) => {
                        let value = row[key];
                        return value < row["LIE"] || value > row["LSE"];
                    });
            });

            if (callSupervisor === true) {
                loader = false;
                message = messageQuery(24);
            } else if (callSupervisor === false) {
                loader = true;
                callPost();
            } else if (quantityReleased !== 0) {
                loader = false;
                return (message = messageQuery(4));
            }
        }
    };

    async function callFinish() {
        finish = false;
        message = messageQuery(0)
        window.location.href = messageQuery(20);
    }

    function close() {
        message = messageQuery(0);
        isRequesting = false;
    }

    function redirect() {
        message = messageQuery(0);
        isRequesting = false;
        window.location.href = messageQuery(17);
    }
    
function handleKeydown(e) {
    if (e.key === "Escape") {
      window.location.href = messageQuery(20);
    }
  }
</script>


<svelte:window on:keydown={handleKeydown} />

<main>
    {#if odf === true}
        <Breadcrumb
            imgResource={back}
            titleBreadcrumb={titleBread}
            on:message={redirect}
        />

        <!-- <div class="breadcrumb-area">
            <div class="cod-area">
                <a
                    tabindex="8"
                    href={messageQuery(17)}
                    on:keypress={redirect}
                    on:click={redirect}
                >
                    <img src={back} alt="" />Dados da ODF</a
                >
            </div>
        </div> -->
    {/if}

    <div class="div-btn">
        <!-- svelte-ignore a11y-positive-tabindex -->
        <button
            on:click={createCol}
            on:keypress={createCol}
            tabindex="21"
            class="btn"
            type="submit">Adicionar coluna</button
        >
        <!-- svelte-ignore a11y-positive-tabindex -->
        <button
            disabled={isRequesting === true}
            on:click={check}
            on:keypress={check}
            tabindex="22"
            class="btn"
            type="submit">Enviar dados</button
        >
    </div>

    <div class="title">{Subtitle}</div>

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
        {#if messageObj == false }
            <div class="table table-responsive">
                <table class="table table-hover table-striped caption-top">
                    <thead>
                        <tr id="modal-content">
                            <th scope="col">{seq}</th>
                            <th scope="col">Item</th>
                            <th scope="col">Descrição</th>
                            <th scope="col">Especif.</th>
                            <th scope="col">LIE</th>
                            <th scope="col">LSE</th>
                            <th scope="col">Instrumento</th>
                            <th scope="col">SETUP</th>
                            {#each extraColumns as columnNumber}
                                <th scope="col">M {columnNumber}</th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody id="body-table">
                        {#each ripTable.data as row, i}
                            <RipTable
                                bind:setup={values}
                                bind:value={row.values}
                                dados={row}
                                indice={i + 1}
                                {extraColumns}
                            />
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/await}

    {#if messageObj === true}
        <div class="message-area">
            <Message
                titleInMessage={message}
                btnInMessage={final}
                on:message={callFinish}
            />
        </div>
    {/if}

    {#if message === "Supervisor needed"}
        <Supervisor bind:supervisor={supervisor} on:message={checkSuper} />
        <!-- <div class="background">
            <div class="modal-content">
                <h3>Supervisor</h3>
                <input
                    bind:value={supervisor}
                    on:keypress={checkSuper}
                    autofocus
                    tabindex="18"
                    onkeyup="this.value = this.value.toUpperCase()"
                    type="text"
                />

                <button tabindex="20" on:click={close} on:keypress={close}
                    >Fechar</button
                >
            </div>
        </div> -->
    {/if }

    {#if message && message === messageQuery(4) && messageObj === true}
        <Message title={message} btn={final} on:message={redirect} />
    {/if}

    {#if message && message !== messageQuery(0) && message !== messageQuery(38) && message !== messageQuery(4) && message !== messageQuery(41)}
        <ModalConfirmation title={message} {message} on:message={close} />
    {/if}
</main>

<style>
    /* .cod-area {
        display: flex;
        margin: 1%;
        padding: 0%;
    }
    a {
        margin: 0%;
        padding: 0%;
        color: #252525;
        font-size: 20px;
    } */
    .loader {
        margin: 0%;
        position: relative;
        width: 10vw;
        height: 5vw;
        padding: 1.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999999999999;
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
        z-index: 999999999999999;
    }
    main {
        letter-spacing: 1px;
    }

    /* .background {
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
    }
    .modal-content {
        color: white;
        background-color: black;
        width: 500px;
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 10px;
    }
    input {
        width: 300px;
        border-radius: 8px;
    } */

    .div-btn {
        display: flex;
        margin: 1%;
        justify-content: right;
        letter-spacing: 1px;
    }
    .title {
        font-size: 35px;
        margin: 1%;
        display: flex;
        justify-content: center;
    }
    .btn {
        margin: 1%;
        padding: 0%;
        font-size: 14px;
        width: 132px;
        height: 35px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 3px;
        background-color: transparent;
        letter-spacing: 1px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
    }

    .btn:hover {
        cursor: pointer;
        background-color: black;
        color: white;
        transition: 1s;
    }
    .table {
        width: 100%;
        height: 100%;
        border: 2px solid #cfd4d9;
        padding: 0 15px 0 15px;
    }
    table {
        width: 100%;
        height: 100%;
    }
    tr {
        position: sticky;
        top: 0;
        overflow: auto;
        background-color: white;
        height: fit-content;
        text-align: center;
    }
</style>
