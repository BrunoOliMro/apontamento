<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    import { onMount } from "svelte";
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

    function createCol() {
        console.log("is gonna create another row until max 13");
    }
</script>

<main>
    <Breadcrumb />
    <div>{Subtitle}</div>

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
            <thead>
                <tr class="header">
                    <th>
                        {#each Object.keys(ripTable[0]) as ripTable}
                            <th scope="col" class="cellBody">{ripTable}</th>
                            {/each}
                        </th>
                        <div class="headerSetup">
                            <div class="headerInput">SETUP</div>
                            <div class="headerInput">M2</div>
                            <div class="headerInput">M3</div>
                            <div class="headerInput">M4</div>
                            <div class="headerInput">M5</div>
                            <div class="headerInput">M6</div>
                            <div class="headerInput">M7</div>
                        </div>
                </tr>
            </thead>
        </form>
        <table>
            <div class="table">
                {#each Object.values(ripTable[0]) as ripTable}
                    <th scope="col" class="cellStats ">{ripTable}</th>
                {/each}
                <th>
                    <div class="headerInput">SETUP</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>

                <th>
                    <div class="headerInput">M2</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M3</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M4</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M5</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M6</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M7</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <!-- <th>
                    <div class="headerInput">M8</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M9</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M10</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M11</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M12</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th>
                <th>
                    <div class="headerInput">M13</div>
                    <div>
                        <input class="input" id="M13" name="M13" />
                    </div>
                </th> -->
            </div>
        </table>
        <button on:click={doPost} class="btnData" type="submit"
            >Enviar dados</button
        >
        <button on:click={createCol} class="btnData" type="submit"
            >Adicionar coluna</button
        >
    {:else}
        <h3>Não há histórico para exibir</h3>
    {/if}
</main>

<style>
    .headerSetup{
        display: flex;
        font-size: 10px;
        border: 1px solid;
        font-weight: bold;
        height: 45px;
    }
    .cellBody{
        font-size: 10px;
        width: 80px;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .cellStats {
        display: flex;
        font-size: 10px;
        width: 80px;
        justify-content: center;
        text-align: center;
        align-items: center;
    }
    th {
        border: 1px solid;
        height: 40px;
    }
    .headerInput {
        font-size: 10px;
        width: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .btnData {
        margin-bottom: 1%;
        padding: 0%;
        font-size: 12px;
        width: 100px;
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

    input {
        font-size: 10px;
        height: 5px;
        width: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    main {
        margin: 1%;
    }
    div {
        font-size: 30px;
        display: flex;
        justify-content: center;
    }
</style>
