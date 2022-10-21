<script>
    // @ts-nocheck
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
    callRip();
    let lie;
    let lsd;

    async function callRip() {
        const res = await fetch(urlString);
        ripTable = await res.json();
        console.log("ripTable: ", ripTable);

        lie = ripTable.map((e) => e.LIE);
        lsd = ripTable.map((e) => e.LSE);

        console.log("lie: ", lie);
        console.log("lsd", lsd);
        if (ripTable.length <= 0) {
            window.location.href = "/#/codigobarras";
            location.reload();
        }
    }

    const doPostSuper = async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        const res = await fetch(supervisorApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                supervisor: !supervisor ? "" : supervisor,
            }),
        }).then((res) => res.json());
        if (res.message === "supervisor encontrado") {
            showSuper = false;
            doPost();
            window.location.href = "/#/codigobarras";
            location.reload();
        } else if (res.message === "supervisor não encontrado") {
            showError = true;
        }
    };

    const doPost = async () => {
        const headers = new Headers();
        const res = await fetch(urlS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                setup: setup,
            }),
        }).then((res) => res.json());
        if (res.message === "rip vazia") {
            showErrorEmpty = true;
        }
        if (res.message === "rip enviada, odf finalizada") {
            showEnd = true;
            window.location.href = "/#/codigobarras";
        }
    };
    function createCol() {
        // Retorna um array de booleans
        let arrayToAddCol = ripTable.map((acc) => {
            let bool = acc.values.setup === "";
            return bool;
        });
        console.log("arrayToAddCol: ", arrayToAddCol);
        //filtra o array e encontra os campos com true, ou seja os campos vazios
        let filterAddCol = arrayToAddCol.filter((e) => e === true);

        //Caso o array de campos vazios retorne vazio, adiciona mais uma coluna
        if (filterAddCol.length <= 0) {
            if (extraColumns.length < 13) {
                extraColumns = [...extraColumns, extraColumns.length + 2];
            }
        } else {
            showSetup = true;
        }
    }
    const check = () => {
        let valueFromUser = Number(Object.values(setup));
        console.log(valueFromUser);
        if (
            valueFromUser >= lie[0] &&
            valueFromUser <= lsd[0] &&
            valueFromUser !== 0
        ) {
            doPost();
        }

        if (valueFromUser < lie[0] && valueFromUser !== 0) {
            showSuper = true;
        }

        if (valueFromUser > lsd[0] && valueFromUser !== 0) {
            showSuper = true;
        } else if (valueFromUser === 0) {
            showErrorEmpty = true;
        }
    };

    function close() {
        showSetup = false;
    }
</script>

<main>
    <div class="bread" />
    <div class="divBtn">
        <button on:click={createCol} class="sideButton" type="submit"
            >Adicionar coluna</button
        >
        <button on:click={check} class="sideButton" type="submit"
            >Enviar dados</button
        >
    </div>
    <div class="title">{Subtitle}</div>
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
    {#if showEnd === true}
        <h3>ODF FINALIZADA</h3>
    {/if}
    {#if showSuper === true}
        <h3>Supervisor</h3>
        <input
            bind:value={supervisor}
            onkeyup="this.value = this.value.toUpperCase()"
            type="text"
            name="supervisor"
            id="supervisor"
        />
        <button on:click={doPostSuper}>Confirma</button>
    {/if}
    {#if showErrorEmpty === true}
        <h3>rip vazia, envio invalido</h3>
    {/if}
    {#if showError === true}
        <h3>Algo deu errado</h3>
    {/if}

    {#if showSetup === true}
        <h3>Preencha as coluna antes</h3>
        <button on:click={close}>Confirma</button>
    {/if}
</main>

<style>
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
    p {
        font-size: 25px;
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
    .returnValue {
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 500px;
        height: 100px;
        border-radius: 3px;
        position: absolute;
        color: white;
        background-color: black;
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
