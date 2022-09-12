<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    import TableRow from "../components/Tables/TableRipRow.svelte";
    import { onMount } from "svelte";
    import TableRipRow from "../components/Tables/TableRipRow.svelte";
    let urlS = `/api/v1/lancamentoRip`;
    let urlString = `/api/v1/rip`;
    let urlStringss = `/api/v1/rip1`;
    let urlStringssSS = `/api/v1/rip2`;
    let urlStringssSS1 = `/api/v1/rip3`;
    let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";
    let SETUP = "SETUP";
    let M2 = "M2";
    let M3 = "M3";
    let M4 = "M4";
    let M5 = "M5";
    let M6 = "M6";
    let M7 = "M7";
    let M8 = "M8";
    let M9 = "M9";
    let M10 = "M10";
    let M11 = "M11";
    let M12 = "M12";
    let M13 = "M13";
    let ripTable = [];

    onMount(async () => {
        const res = await fetch(urlString);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });

    onMount(async () => {
        const res = await fetch(urlStringss);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });

    onMount(async () => {
        const res = await fetch(urlStringssSS);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });

    onMount(async () => {
        const res = await fetch(urlStringssSS1);
        ripTable = await res.json();
        console.log(ripTable[0]);
    });

    const doPost = async (
        /** @type {any} */ error,
        /** @type {Response} */ res
    ) => {
        console.log("click");
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        res = await fetch(urlS, {
            method: "POST",
            body: JSON.stringify({
                SETUP: !SETUP ? "" : SETUP,
                M2: M2,
                M3: M3,
                M4: M4,
                M5: M5,
                M6: M6,
                M7: M7,
                M8: M8,
                M9: M9,
                M10: M10,
                M11: M11,
                M12: M12,
                M13: M13,
            }),
            headers,
        });
    };

    let numbers = [1];
    function createCol() {
        if (numbers.length < 7) numbers = [...numbers, numbers.length + 1];
    }
</script>

<main>
    <Breadcrumb />
    <div class="title">{Subtitle}</div>
    <div class="btn">
        <button on:click={createCol} class="btnData" type="submit"
            >Adicionar coluna</button
        >
        <button on:click={doPost} class="btnData" type="submit"
            >Enviar dados</button
        >
    </div>
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
    {#if ripTable.length != 0}
        <form action="/api/v1/lancamentoRip" method="POST">
            <div class="tabela table-responsive">
                <table class="table table-hover table-striped caption-top">
                    <!-- <caption>Lista Completa</caption> -->
                    <thead>
                        <tr id="header">
                            <th scope="col">Item</th>
                            <th scope="col">Descrição</th>
                            <th scope="col">Especif.</th>
                            <th scope="col">LIE</th>
                            <th scope="col">LSE</th>
                            <th scope="col">SETUP</th>
                            <th scope="col">Instrumento</th>
                            <th scope="col">M {numbers}</th>
                        </tr>
                    </thead>
                    <tbody id="corpoTabela">
                        {#each ripTable as row}
                            <TableRipRow dados={row} />
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
    .btn {
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
    .btnData {
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

    .btnData:hover {
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
