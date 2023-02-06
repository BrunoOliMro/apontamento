<script>
    // @ts-ignore
    import AddressTable from "../table/addressTable.svelte";
    import { createEventDispatcher } from "svelte";
    export let odfData = null;
    let currentPage = 1;
    let minValue = 0;
    let maxValue = 11;
    let message = "";
    let list = false;
    let openListString = "Abrir lista completa";

    const dispatch = createEventDispatcher();

    function close(event) {
        dispatch("message", {
            text: "Close Modal Historico",
            eventType: event,
        });
    }

    function callOpenList() {
        currentPage = 1;
        if (list === true) {
            openListString = "Abrir lista completa";
            list = false;
            maxValue = 11;
            minValue = 0;
        } else {
            list = true;
            openListString = "Fechar lista completa";
            maxValue = odfData.data.length;
            minValue = 0;
        }
    }

    function callNextPage() {
        if (currentPage <= 0) {
            currentPage = 1;
        } else {
            maxValue = maxValue + 10;
            minValue = minValue + 10;
            currentPage += 1;
        }
    }

    function callPreviousPage() {
        if (currentPage <= 0) {
            currentPage = 1;
        } else {
            minValue = minValue - 10;
            maxValue = maxValue - 10;
            currentPage -= 1;
        }
    }

    // @ts-ignore
    if (!odfData.data) {
        message = "Error";
    }
</script>

<div class="btns-control-page-area">
    <div class="btn-area">
        <button
            class="btn"
            on:click={callOpenList}
            on:keypress={callOpenList}>{openListString}</button
        >
    </div>
    
    <div class="btn-area">
        <button class="btn" on:click={close} on:keypress={close}
            >Voltar</button
        >
    </div>
</div>

{#if (odfData && odfData !== "") || message !== ""}
    <div class="background">
        <div class="modal-content">
            <h2>Histórico de endereçamento</h2>
            <div class="address-area">
                <table>
                    {#if message === ""}
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
                            <AddressTable
                                index={i + 1}
                                min={minValue}
                                max={maxValue}
                                data={address}
                            />
                        {/each}
                    {/if}

                    {#if message && message !== ""}
                        <div>Sem historico a exibir</div>
                    {/if}
                </table>
            </div>
        </div>

        <div class="pagination-area">
            {#if odfData.data.length - 1 > 11}
                {#if list === false}
                    <button
                        disabled={currentPage <= 1}
                        class="btn"
                        on:click={callPreviousPage}
                        on:keypress={callPreviousPage}>Anterior</button
                    >

                    <span>{currentPage}</span>-<span>{Math.round(odfData.data.length / 11)}</span>

                    <button
                        disabled={currentPage === (Math.round(odfData.data.length / 11))}
                        class="btn"
                        on:click={callNextPage}
                        on:keypress={callNextPage}>Proxima</button
                    >
                {/if}
            {/if}
        </div>

    </div>
{/if}

<style>
    .btns-control-page-area{
        display: flex;
        flex-direction: row;
        margin: 1%;
        padding: 0%;
        justify-content: right;
        align-items: right;
        text-align: right;
    }
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
