<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    import TableRow from "../components/Tables/TableRipRow.svelte";
    import { onMount } from "svelte";
    import TableRipRow from "../components/Tables/TableRipRow.svelte";
    let urlS = `/api/v1/lancamentoRip`;
    let urlString = `/api/v1/rip`;
    let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";
    let SETUP = "";
    let M2 = "";
    let M3 = "";
    let M4 = "";
    let M5 = "";
    let M6 = "";
    let M7 = "";
    let M8 = "";
    let M9 = "";
    let M10 = "";
    let M11 = "";
    let M12 = "";
    let M13 = "";
    let ripTable = [];

    onMount(async () => {
        const res = await fetch(urlString);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });

    const doPost = async (
        /** @type {any} */ error,
        /** @type {Response} */ res
    ) => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        res = await fetch(urlS, {
            method: "POST",
            body: JSON.stringify({
                SETUP: SETUP,
                M2: M2,
                M3: M3,
                M4: M4,
                M5: M5,
                M6: M6,
            }),
            headers,
        });
    };

    let seq = "Seq";
    let extraColumns = [];
    function createCol() {
        if (extraColumns.length < 7) {
            extraColumns = [...extraColumns, extraColumns.length + 6];
        }
    }
</script>

<main>
    <Breadcrumb />
    <div class="divBtn">
        <button on:click={createCol} class="sideButton" type="submit"
            >Adicionar coluna</button
        >
        <button on:click={doPost} class="sideButton" type="submit"
            >Enviar dados</button
        >
    </div>
    <div class="title">{Subtitle}</div>
    <!-- <button
        type="button"
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#exampleModalLong"
    >
        Desefetivar Lançamento
    </button> -->

    <!-- <div
        class="modal fade"
        id="exampleModalLong"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLongTitle"
        aria-modal="true"
    >
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLongTitle">
                        Para alterar um lançamento, Selecione um Supervisor
                    </h5>
                    <button
                        type="button"
                        class="close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                    >
                    </button>
                </div>
                <div class="modal-body">...</div>
                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal">Fechar</button
                    >
                </div>
            </div>
        </div>
    </div> -->
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
                            <th scope="col">M 2</th>
                            <th scope="col">M 3</th>
                            <th scope="col">M 4</th>
                            <th scope="col">M 5</th>
                            {#each extraColumns as columnNumber}
                                <th scope="col">M {columnNumber}</th>
                            {/each}
                            <!-- <th scope="col">M {numbers}</th> -->
                        </tr>
                    </thead>
                    <tbody id="corpoTabela">
                        {#each ripTable as row, i}
                            <TableRipRow
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
        <h3>Não há histórico para exibir</h3>
    {/if}
</main>

<style>
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
        width: 120px;
        height: 35px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 3px;
        background-color: transparent;
    }

    .sideButton:hover {
        cursor: pointer;
        background-color: black;
        color: white;
        transition: 1s;
    }
    main {
        margin: 1%;
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
