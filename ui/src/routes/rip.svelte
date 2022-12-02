<script>
    // @ts-nocheck
    let imageLoader = "/images/axonLoader.gif";
    import TableRipRow from "../components/Tables/TableRipRow.svelte";
    let seq = "Seq";
    let extraColumns = [];
    let pointRipRouter = `/api/v1/pointRip`;
    let ripRouter = `/api/v1/rip`;
    let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";
    let ripTable = [];
    let setup = {};
    let showErrorEmpty = false;
    let showSuper = false;
    let supervisorMessage = "";
    let supervisorRouter = `/api/v1/supervisor`;
    let showError = false;
    let showSetup = false;
    const promiseResult = callRip();
    let lie;
    let lsd;
    let loader = false;
    let odfFinish = false;
    let badgeMessage = "";
    let redirect;

    async function callRip() {
        const res = await fetch(ripRouter);
        ripTable = await res.json();

        if(ripTable.message === 'Não há rip a mostrar'){
            loader = true;
            await doPost()
            return window.location.href = `${ripTable.url}`;
        }

        lie = ripTable.map((acc) => acc.LIE);
        lsd = ripTable.map((acc) => acc.LSE);
    }

    function checkSuper(event) {
        if (supervisorMessage.length >= 6 && event.key === "Enter") {
            if (supervisorMessage === "000000") {
                badgeMessage = "cracha invalido";
            }
            doPostSuper();
        }
    }

    const doPostSuper = async () => {
        loader = true;
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        const res = await fetch(supervisorRouter, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                supervisor: !supervisorMessage ? "" : supervisorMessage,
            }),
        }).then((res) => res.json());
        loader = false;
        console.log("linha 60 /do post Super/", res);
        if (res.message === "Supervisor encontrado") {
            showSuper = false;
            await doPost();
            //odfFinish = true;
            //window.location.href = "/#/codigobarras";
            //location.reload();
        } else if (res.message === "Supervisor não encontrado") {
            showError = true;
        }
    };

    const doPost = async () => {
        loader = true;
        const headers = new Headers();
        const res = await fetch(pointRipRouter, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                setup: setup,
            }),
        }).then((res) => res.json());
        console.log("linha 84 res. rip", res);

        if (res) {
            loader = false;
        }

        if(res.message === 'Não há rip a mostrar'){
            return window.location.href =`${res.url}`;
        }
        if (res.message === "rip vazia") {
            showErrorEmpty = true;
        }
        if (res.message === "rip enviada, odf finalizada") {
            odfFinish = true;
            redirect = res.url;
            //window.location.href = "/#/codigobarras";
        }
        if (res.message === "ocorreu um erro ao enviar os dados da rip") {
            badgeMessage = "ocorreu um erro ao enviar os dados da rip";
            //window.location.href = "/#/codigobarras";
        }
    };

    function callFinish() {
        odfFinish = false;
        window.location.href = redirect;
    }

    function createCol() {
        const quantityReleased = Object.values(setup).length - ripTable.length;
        const amountTotalToSend = extraColumns.length * ripTable.length;

        let arrayToAddCol = ripTable.reduce((acc, int) => {
            if (acc.values === undefined) {
                return false;
            } else if (acc.values >= 0 && int.values >= 0) {
                return true;
            }
        });

        if (amountTotalToSend === quantityReleased) {
            if (arrayToAddCol === true) {
                if (extraColumns.length < 13) {
                    extraColumns = [...extraColumns, extraColumns.length + 2];
                }
            }
        } else if (amountTotalToSend !== quantityReleased) {
            showSetup = true;
        }
    }

    const check = () => {
        if (Object.values(setup).length <= 0 || Object.values(setup).length < ripTable.length) {
            return (showSuper = true);
        }

        const rows = Object.keys(setup).reduce((acc, key, i) => {
            if (ripTable[i].LSE === null && ripTable[i].LIE === null) {
                ripTable[i].LSE = "OK";
                ripTable[i].LIE = "OK";
            }

            const [col, lin] = key.split("-");
            if (acc[lin] === undefined) acc[lin] = {};
            acc[lin][col] = setup[key];
            if (!acc[lin]["LIE"]) acc[lin]["LIE"] = ripTable[i].LIE;
            if (!acc[lin]["LSE"]) acc[lin]["LSE"] = ripTable[i].LSE;
            return acc;
        }, {});

        const callSupervisor = Object.values(rows).some((row) => {
            return Object.keys(row)
                .filter((key) => key !== "LIE" && key !== "LSE")
                .some((key) => {
                    let value = row[key];
                    if (value === "ok") {
                        value = false;
                    }
                    return value < row["LIE"] || value > row["LSE"];
                });
        });

        console.log('linha 165 /rip.svelte/', callSupervisor,);

        if (callSupervisor === true) {
            loader = false;
            showSuper = true;
        } else if (callSupervisor === false) {
            loader = true;
            doPost();
        }
    };

    function close() {
        showSetup = false;
        showSuper = false;
        showError = false;
        showErrorEmpty = false;
        badgeMessage = "";
    }
</script>

<main>
    <div class="bread" />
    <div class="divBtn">
        <button
            on:click={createCol}
            on:keypress={createCol}
            tabindex="21"
            class="sideButton"
            type="submit">Adicionar coluna</button
        >
        <button
            on:click={check}
            on:keypress={check}
            tabindex="22"
            class="sideButton"
            type="submit">Enviar dados</button
        >
    </div>

    <div class="title">{Subtitle}</div>
    {#if loader === true}
        <div class="imageLoader">
            <div class="loader">
                <img src={imageLoader} alt="" />
            </div>
        </div>
    {/if}

    {#await promiseResult}
        <div class="imageLoader">
            <div class="loader">
                <img src={imageLoader} alt="" />
            </div>
        </div>
    {:then itens}
        {#if ripTable.length !== 0}
            <form action="/api/v1/lancamentoRip" method="POST">
                <div class="tabela table-responsive">
                    <table class="table table-hover table-striped caption-top">
                        <thead>
                            <tr id="header">
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
                        <tbody id="corpoTabela">
                            {#each ripTable as row, i}
                                <TableRipRow
                                    bind:setup
                                    bind:value={row.values}
                                    dados={row}
                                    indice={i + 1}
                                    {extraColumns}
                                />
                            {/each}
                        </tbody>
                    </table>
                </div>
            </form>
        {:else}
            <h2>Não há histórico para exibir</h2>
        {/if}
    {/await}
    {#if odfFinish === true}
        <div class="fundo">
            <div class="header">
                <h3>ODF FINALIZADA</h3>
                <button on:click={callFinish} on:keypress={callFinish}
                    >Fechar</button
                >
            </div>
        </div>
    {/if}
    {#if showSuper === true}
        <div class="fundo">
            <div class="header">
                <h3>Supervisor</h3>
                <input
                    autofocus
                    tabindex="18"
                    bind:value={supervisorMessage}
                    on:keypress={checkSuper}
                    onkeyup="this.value = this.value.toUpperCase()"
                    type="text"
                    name="supervisor"
                    id="supervisor"
                />
                <button tabindex="20" on:click={close} on:keypress={close}
                    >Fechar</button
                >
            </div>
        </div>
    {/if}
    {#if showErrorEmpty === true}
        <div class="fundo">
            <div class="header">
                <h3>Rip vazia, envio inválido</h3>
                <button on:click={close} on:keypress={close}>Confirma</button>
            </div>
        </div>
    {/if}
    {#if showError === true}
        <div class="fundo">
            <div class="header">
                <h3>Algo deu errado</h3>
                <button on:click={close} on:keypress={close}>Confirma</button>
            </div>
        </div>
    {/if}
    {#if showSetup === true}
        <div class="fundo">
            <div class="header">
                <h3>Preencha todos os campos</h3>
                <button on:click={close} on:keypress={close}>Fechar</button>
            </div>
        </div>
    {/if}
    {#if badgeMessage === "ocorreu um erro ao enviar os dados da rip"}
        <div class="fundo">
            <div class="header">
                <h3>Erro ao enviar a rip</h3>
                <button on:click={close} on:keypress={close}>Fechar</button>
            </div>
        </div>
    {/if}
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
        z-index: 9999999999999;
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
        z-index: 999999999999999;
    }
    .bread {
        margin-left: 1%;
        margin-top: 5px;
    }
    .divBtn {
        letter-spacing: 1px;
    }
    main {
        letter-spacing: 1px;
    }
    h2 {
        font-size: 30px;
    }

    .fundo {
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
    .header {
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
    }

    .divBtn {
        display: flex;
        margin: 1%;
        justify-content: right;
    }
    .title {
        font-size: 35px;
        margin: 1%;
        display: flex;
        justify-content: center;
    }
    .sideButton {
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

    .sideButton:hover {
        cursor: pointer;
        background-color: black;
        color: white;
        transition: 1s;
    }
    .tabela {
        width: 100%;
        height: 100%;
        border: 2px solid #cfd4d9;
        /* border-radius: 10px; */
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
