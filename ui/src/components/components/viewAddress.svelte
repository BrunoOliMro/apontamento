<script>
    import TableAddress from "../Tables/tableAddress.svelte";
    export let odfData = null;
    let currentPage = 1;
    // @ts-ignore
    let totalPages = Math.ceil(odfData.data.length / 10);

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function close(event) {
        dispatch("message", {
            text: "Close Modal Historico",
            eventType: event,
        });
    }

    let minValue = 0
    let maxValue = 11

    function callNextPage() {
        if (currentPage <= 0) {
            currentPage = 1;
        } else {
            maxValue = maxValue + 11
            minValue = minValue + 11
            currentPage += 1;
        }
    }

    function callPreviousPage() {
        if (currentPage <= 0) {
            currentPage = 1;
        } else {
            minValue = minValue - 11
            maxValue = maxValue - 11
            currentPage -= 1;
        }
    }
</script>

{#if odfData && odfData !== ""},
    <div class="background">
        <div class="modal-content">
            <h2>Histórico de endereçamento</h2>
            <div class="address-area">
                <table>
                    <tr id="header">
                        <th scope="col">INDICE</th>
                        <th scope="col">DATA</th>
                        <th scope="col">ODF</th>
                        <th scope="col">CODIGO DA PEÇA</th>
                        <th scope="col">ENDEREÇO</th>
                        <th scope="col">STATUS</th>
                        <th scope="col">QUANTIDADE</th>
                    </tr>

                    {#each odfData.data as address, i}
                        <TableAddress
                            perPage={10}
                            index={i + 1}
                            min={minValue}
                            max={maxValue}
                            data={address}
                            totalItens={odfData.data.length}
                            {totalPages}
                            {currentPage}
                        />
                    {/each}
                </table>
            </div>
        </div>

        <div class="pagination-area">
            {#if odfData.data.length > 11}
                <button
                    disabled={currentPage <= 1}
                    class="btn"
                    on:click={callPreviousPage}
                    on:keypress={callPreviousPage}>Anterior</button
                >

                <span>{currentPage}</span>

                <button
                    disabled={currentPage >= totalPages}
                    class="btn"
                    on:click={callNextPage}
                    on:keypress={callNextPage}>Proxima</button
                >
            {/if}
        </div>

        <div class="btn-area">
            <button class="btn" on:click={close} on:keypress={close}
                >Voltar</button
            >
        </div>
    </div>
{/if}

<style>
    .pagination-area {
        display: flex;
        flex-direction: row;
        margin: 1%;
        padding: 0%;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .btn-area {
        margin: 1%;
        padding: 0%;
        display: flex;
        flex-direction: row;
        justify-content: right;
        text-align: right;
        align-items: right;
    }
    .btn {
        outline: none;
        margin: 1%;
        padding: 0%;
        width: 225px;
        height: 30px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 6px;
        background-color: white;
        border: none;
        color: black;
        border-color: #999999;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        letter-spacing: 1px;
    }

    .btn:hover {
        cursor: pointer;
        background-color: white;
        color: blue;
        transition: all 1s;
    }
    /* .modal-content {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        top: 0;
        left: 0;
        width: 1200px;
        height: 800px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 14px;
    }
    .background {
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
    } */

    h2 {
        display: flex;
        flex-direction: row;
        text-align: center;
        justify-content: center;
        align-items: center;
    }
    .address-area {
        width: 99%;
        color: black;
        margin: 1%;
        padding: 0%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        align-items: center;
        height: 100%;
        letter-spacing: 1px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        border-radius: 10px;
    }
</style>
