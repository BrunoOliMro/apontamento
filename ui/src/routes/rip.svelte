<script>
    // @ts-nocheck
    let imageLoader = "/images/axonLoader.gif";
    import TableRipRow from "../components/Tables/TableRipRow.svelte";
    let seq = "Seq";
    let extraColumns = [];
    let urlS = `/api/v1/lancamentoRip`;
    let urlString = `/api/v1/rip`;
    let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";
    let showEnd = false;
    let ripTable = [];
    let setup = {};
    let showErrorEmpty = false;
    let showSuper = false;
    let supervisor = "";
    let supervisorApi = `/api/v1/supervisor`;
    let showError = false;
    let showSetup = false;
    let resultado = callRip();
    let lie;
    let lsd;
    let loader = false;
    let odfFinish = false;
    let crachModal = "";

    async function callRip() {
        const res = await fetch(urlString);
        ripTable = await res.json();

        lie = ripTable.map((acc) => acc.LIE);
        lsd = ripTable.map((acc) => acc.LSE);

        if (ripTable.length <= 0) {
            loader = true;
            window.location.href = "/#/codigobarras";
            location.reload();
        }
    }
    function checkSuper(event) {
        if (supervisor.length >= 6 && event.key === "Enter") {
            if (supervisor === "000000") {
                crachModal = "cracha invalido";
            }
            doPostSuper();
        }
    }

    const doPostSuper = async () => {
        loader = true;
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        const res = await fetch(supervisorApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                supervisor: !supervisor ? "" : supervisor,
            }),
        }).then((res) => res.json());
        loader = false;
        if (res.message === "supervisor encontrado") {
            showSuper = false;
            doPost();
            odfFinish = true;
            window.location.href = "/#/codigobarras";
            location.reload();
        } else if (res.message === "supervisor não encontrado") {
            showError = true;
        }
    };

    const doPost = async () => {
        loader = true;
        const headers = new Headers();
        const res = await fetch(urlS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                setup: setup,
            }),
        }).then((res) => res.json());
        loader = false;
        if (res.message === "rip vazia") {
            showErrorEmpty = true;
        }
        if (res.message === "rip enviada, odf finalizada") {
            odfFinish = true;
            //window.location.href = "/#/codigobarras";
        }
        if (res.message === "ocorreu um erro ao enviar os dados da rip") {
            crachModal = "ocorreu um erro ao enviar os dados da rip";
            //window.location.href = "/#/codigobarras";
        }
    };

    function finish() {
        odfFinish = false;
        window.location.href = "/#/codigobarras";
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
        //loader = true;
        if (Object.values(setup).length <= 0) {
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

    {#await resultado}
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
                                <!-- <th scope="col">M 2</th>
                            <th scope="col">M 3</th>
                            <th scope="col">M 4</th>
                            <th scope="col">M 5</th> -->
                                {#each extraColumns as columnNumber}
                                    <th scope="col">M {columnNumber}</th>
                                {/each}
                            </tr>
                        </thead>
                        <tbody id="corpoTabela">
                            {#each ripTable as row, i}
                                <TableRipRow
                                    bind:setup
                                    bind:values={row.values}
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
                <button on:click={finish} on:keypress={finish}>Fechar</button>
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
                    bind:value={supervisor}
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

    {#if crachModal === "ocorreu um erro ao enviar os dados da rip"}
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
    /* .close{
        display: flex;
        justify-content: right;
        text-align: right;
        align-items: right;
    } */
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
        /* position: absolute;
        top: 20%;
        left: 40%; */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 3px;
    }
    input {
        width: 300px;
        border-radius: 3px;
    }
    /* .returnValue {
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 500px;
        height: 100px;
        border-radius: 3px;
        position: absolute;
        color: white;
        background-color: black;
    } */
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
