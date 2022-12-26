<script>
    // @ts-nocheck
    import TableRipRow from "../components/Tables/TableRipRow.svelte";
    let imageLoader = "/images/axonLoader.gif";
    let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";
    let pointRipRouter = `/api/v1/pointRip`;
    let supervisorRouter = `/api/v1/supervisor`;
    let redirect = `/#/codigobarras`;
    let ripRouter = `/api/v1/rip`;
    let seq = "Seq";
    let showErrorEmpty = false;
    let showSetup = false;
    let showError = false;
    let showSuper = false;
    let odfFinish = false;
    let loader = false;
    let ripTable = [];
    let extraColumns = [];
    let setup = {};
    let supervisor = "";
    let message = "";
    let lsd;
    let lie;
    let promiseResult = callRip();

    async function callRip() {
        const res = await fetch(ripRouter);
        ripTable = await res.json();
        if (ripTable) {
            loader = false;
            if (ripTable.message === "Não há rip a mostrar") {
                post();
            }
            if (ripTable.message !== "") {
                message = ripTable.message;
            }

            lie = ripTable.map((acc) => acc.LIE);
            lsd = ripTable.map((acc) => acc.LSE);
        } else {
            return (message = "Algo deu errado");
        }
    }

    function checkSuper(event) {
        if (supervisor.length >= 6 && event.key === "Enter") {
            if (supervisor === "000000") {
                message = "Crachá inválido";
            }
            doPostSuper();
        }
    }

    const doPostSuper = async () => {
        loader = true;
        const res = await fetch(supervisorRouter, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                supervisor: !supervisor ? "" : supervisor,
            }),
        }).then((res) => res.json());
        loader = false;
        if (res.message === "Supervisor found") {
            showSuper = false;
            post();
        } else if (res.message === "Supervisor not found") {
            showError = true;
        }
    };

    const post = async () => {
        loader = true;
        const res = await fetch(pointRipRouter, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                setup: !setup ? "" : setup,
            }),
        }).then((res) => res.json());
        if (res) {
            if (res.message === "Pointed") {
                window.location.href = "/#/rip";
                location.reload();
            }
            if (
                res.message === "Success" ||
                res.message === "Não há rip a mostrar"
            ) {
                loader = false;
                odfFinish = true;
            } else if (res.message === "rip vazia") {
                showErrorEmpty = true;
            } else if (res.message !== "") {
                message = res.message;
            }
        } else {
            message = "Algo deu errado";
        }
    };

    function callFinish() {
        odfFinish = false;
        window.location.href = redirect;
    }

    function createCol() {
        const quantityReleased =
            Object.values(setup).length - ripTable.length * extraColumns.length;

        if (quantityReleased - ripTable.length === 0) {
            if (extraColumns.length < 13) {
                extraColumns = [...extraColumns, extraColumns.length + 2];
            }
        } else {
            showSetup = true;
        }
    }

    // Erro ao tentar enviar mais de uma coluna
    const check = () => {
        if (
            Object.values(setup).length <= 0 ||
            Object.values(setup).length < ripTable.length
        ) {
            return (showSuper = true);
        }

        let copyOfExtraCol = extraColumns;
        let extraArrayCollumns = [];
        if (extraColumns.length === 1) {
            extraArrayCollumns.push(copyOfExtraCol + 1);
        }

        const quantityReleased =
            ripTable.length * extraArrayCollumns.length -
            Object.values(setup).length;

        if (quantityReleased === 0) {
            const rows = Object.keys(setup).reduce((acc, iterator) => {
                // if (ripTable[i].LSE === null && ripTable[i].LIE === null) {
                //     ripTable[i].LSE = "OK";
                //     ripTable[i].LIE = "OK";
                // }
                const [col, lin] = iterator.split("-");
                if (acc[lin] === undefined) acc[lin] = {};
                acc[lin][col] = setup[iterator];
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
                showSuper = true;
            } else if (callSupervisor === false) {
                loader = true;
                post();
            }
        } else if (quantityReleased !== 0) {
            loader = false;
            return (showSuper = true);
        }
    };

    function close() {
        showSetup = false;
        showSuper = false;
        showError = false;
        showErrorEmpty = false;
        message = "";
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
    {#if message === "ocorreu um erro ao enviar os dados da rip"}
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
