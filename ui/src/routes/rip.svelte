<script>
    // @ts-nocheck
    import post from "../utils/postFunction";
    import Message from "../components/components/message.svelte";
    import { verifyStringLenght } from "../utils/verifyLength";
    import TableRipRow from "../components/Tables/TableRipRow.svelte";
    import checkRipTable from "../utils/checkRip";
    let imageLoader = "/images/axonLoader.gif";
    let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";
    let pointRipRouter = `/api/v1/pointRip`;
    let supervisorRouter = `/api/v1/supervisor`;
    let redirect = `/#/codigobarras`;
    let ripRouter = `/api/v1/rip`;
    let seq = "Seq";
    let finish = false;
    let loader = false;
    let isRequesting = false;
    let ripTable = [];
    let extraColumns = [];
    let values = {};
    let supervisor = "";
    let message = "";
    let lsd;
    let lie;
    let result = callRip();

    async function callRip() {
        const res = await fetch(ripRouter);
        ripTable = await res.json();
        console.log("ripTable", ripTable);
        if (ripTable) {
            loader = false;
            if (ripTable.message === "Não há rip a mostrar") {
                const res = await post(pointRipRouter, values);
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
                        finish = true;
                    } else if (res.message === "rip vazia") {
                        isRequesting = false;
                        message = "Rip vazia";
                    } else if (res.message !== "") {
                        isRequesting = false;
                        message = res.message;
                    }
                } else {
                    message = "Algo deu errado";
                }
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

    // function checkSuper(event) {
    //     if (supervisor.length >= 6 && event.key === "Enter") {
    //         if (supervisor === "000000") {
    //             message = "Crachá inválido";
    //         }
    //         postSupervisor();
    //     }
    // }
    async function checkSuper(event) {
        const resultVerifySupervisor = await verifyStringLenght(
            event,
            supervisor,
            6,
            8
        );
        if (resultVerifySupervisor === "Success") {
            const res = await post(pointRipRouter, values);
            console.log(
                "oirntibnritbriotbn itrnbitbtrbrtbbt tbrt btbtb linha 57",
                res
            );
        }
    }

    // const postSupervisor = async () => {
    //     isRequesting = true;
    //     loader = true;
    //     const res = post(supervisorRouter, supervisor, loader);
    // };

    // const postSupervisor = async () => {
    //     const res = await fetch(supervisorRouter, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({
    //             supervisor: !supervisor ? "" : supervisor,
    //         }),
    //     }).then((res) => res.json());
    //     loader = false;

    //     if (res) {
    //         if (res.message) {
    //             if (res.message === "Supervisor found") {
    //                 post();
    //             } else if (res.message !== "") {
    //                 isRequesting = false;
    //                 message = res.message;
    //             }
    //         }
    //     }

    // if (res.message === "Supervisor found") {
    //     showSuper = false;
    //     post();
    // } else if (res.message === "Supervisor not found") {
    //     showError = true;
    // }
    // };

    // const post = async () => {
    //     isRequesting = true;
    //     loader = true;
    //     const res = await fetch(pointRipRouter, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({
    //             setup: !setup ? "" : setup,
    //         }),
    //     }).then((res) => res.json());
    //     if (res) {
    //         if (res.message === "Pointed") {
    //             window.location.href = "/#/rip";
    //             location.reload();
    //         }
    //         if (
    //             res.message === "Success" ||
    //             res.message === "Não há rip a mostrar"
    //         ) {
    //             loader = false;
    //             finish = true;
    //         } else if (res.message === "rip vazia") {
    //             isRequesting = false;
    //             message = "Rip vazia";
    //         } else if (res.message !== "") {
    //             isRequesting = false;
    //             message = res.message;
    //         }
    //     } else {
    //         message = "Algo deu errado";
    //     }
    // };

    function callFinish() {
        finish = false;
        window.location.href = redirect;
    }

    function createCol() {
        const quantityReleased =
            Object.values(values).length -
            ripTable.length * extraColumns.length;

        if (quantityReleased - ripTable.length === 0) {
            if (extraColumns.length < 13) {
                extraColumns = [...extraColumns, extraColumns.length + 2];
            }
        } else {
            showSetup = true;
        }
    }

    let z;
    // Erro ao tentar enviar mais de uma coluna
    const check = async () => {
        const x = await checkRipTable(
            values,
            ripTable,
            extraColumns,
            message,
            loader,
            res,
            (z = post(pointRipRouter, values, loader)),
            pointRipRouter
        );
        message = x;
    };

    // const check = () => {
    //     if (
    //         Object.values(setup).length <= 0 ||
    //         Object.values(setup).length < ripTable.length
    //     ) {
    //         return (message = "Preencha todos os campos");
    //     }

    //     let copyOfExtraCol = extraColumns;
    //     let extraArrayCollumns = [];
    //     if (extraColumns.length === 1) {
    //         extraArrayCollumns.push(copyOfExtraCol + 1);
    //     }

    //     const quantityReleased =
    //         ripTable.length * extraArrayCollumns.length -
    //         Object.values(setup).length;

    //     if (quantityReleased === 0) {
    //         const rows = Object.keys(setup).reduce((acc, iterator) => {
    //             // if (ripTable[i].LSE === null && ripTable[i].LIE === null) {
    //             //     ripTable[i].LSE = "OK";
    //             //     ripTable[i].LIE = "OK";
    //             // }
    //             const [col, lin] = iterator.split("-");
    //             if (acc[lin] === undefined) acc[lin] = {};
    //             acc[lin][col] = setup[iterator];
    //             return acc;
    //         }, {});

    //         const callSupervisor = Object.values(rows).some((row) => {
    //             return Object.keys(row)
    //                 .filter((key) => key !== "LIE" && key !== "LSE")
    //                 .some((key) => {
    //                     let value = row[key];
    //                     return value < row["LIE"] || value > row["LSE"];
    //                 });
    //         });

    //         if (callSupervisor === true) {
    //             loader = false;
    //             message = "Supervisor needed";
    //         } else if (callSupervisor === false) {
    //             loader = true;
    //             res = post(pointRipRouter, setup, loader);
    //         }
    //     } else if (quantityReleased !== 0) {
    //         loader = false;
    //         return (message = "Algo deu errado");
    //     }
    // };

    function close() {
        message = "";
    }
</script>

<main>
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
        {#if ripTable.length !== 0}
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
                        {#each ripTable as row, i}
                            <TableRipRow
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
        {:else}
            <h2>Não há histórico para exibir</h2>
        {/if}
    {/await}

    {#if finish === true}
        <Message on:click={callFinish} on:keypress={callFinish} />
    {/if}

    <!-- {#if finish === true}
        <div class="background">
            <div class="modal-content">
                <h3>ODF FINALIZADA</h3>
                <button on:click={callFinish} on:keypress={callFinish}
                    >Fechar</button
                >
            </div>
        </div>
    {/if} -->
    {#if message === "Supervisor needed"}
        <div class="background">
            <div class="modal-content">
                <h3>Supervisor</h3>
                <!-- svelte-ignore a11y-autofocus -->
                <!-- svelte-ignore a11y-positive-tabindex -->
                <input
                    bind:value={supervisor}
                    on:keypress={checkSuper}
                    autofocus
                    tabindex="18"
                    onkeyup="this.value = this.value.toUpperCase()"
                    type="text"
                />

                <!-- svelte-ignore a11y-positive-tabindex -->
                <button tabindex="20" on:click={close} on:keypress={close}
                    >Fechar</button
                >
            </div>
        </div>
    {/if}

    {#if message !== "" && message !== "Supervisor needed"}
        <div class="background">
            <div class="modal-content">
                <h3>{message}</h3>
                <button on:click={close} on:keypress={close}>Confirma</button>
            </div>
        </div>
    {/if}
    <!-- {#if showErrorEmpty === true}
        <div class="background">
            <div class="modal-content">
                <h3>Rip vazia, envio inválido</h3>
                <button on:click={close} on:keypress={close}>Confirma</button>
            </div>
        </div>
    {/if} -->
    <!-- {#if showError === true}
        <div class="background">
            <div class="modal-content">
                <h3>Algo deu errado</h3>
                <button on:click={close} on:keypress={close}>Confirma</button>
            </div>
        </div>
    {/if} -->
    <!-- {#if showSetup === true}
        <div class="background">
            <div class="modal-content">
                <h3>Preencha todos os campos</h3>
                <button on:click={close} on:keypress={close}>Fechar</button>
            </div>
        </div>
    {/if} -->
    <!-- {#if message === "ocorreu um erro ao enviar os dados da rip"}
        <div class="background">
            <div class="modal-content">
                <h3>Erro ao enviar a rip</h3>
                <button on:click={close} on:keypress={close}>Fechar</button>
            </div>
        </div>
    {/if} -->
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
    h2 {
        font-size: 30px;
    }

    .background {
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
    }

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
