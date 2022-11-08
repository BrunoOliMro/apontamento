<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function confirma() {
        dispatch("message", {
            text: "teste basso cabaço",
        });
    }

    // function closePop(){
    //     dispatch("message", {
    //         text: "teste2222222",
    //     });
    // }
</script>

<div>
<div class="modalBackground">
    <div class="itensInsideModal">
        <div class="closePopDiv">
            <button
                class="btnPop"
                id="closePop"
                on:keypress={confirma}
                on:click={confirma}>FECHAR</button>
        </div>

        <!-- <div class="modalContent">
            <h2 class="modalTitle">Motivo da Parada</h2>
            <div class="optionsBar">
                <select autofocus tabindex="10" bind:value>
                    {#each dados as item}
                        <option>{item}</option>
                    {/each}
                </select>
            </div> -->

            <div class="confirmPopDiv">
                <button
                autofocus
                    class="btnPop"
                    id="confirmPop"
                    tabindex="11"
                    on:keypress={confirma}
                    on:click={confirma}
                >
                    CONFIRMAR
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    button {
        letter-spacing: 0.5px;
        width: fit-content;
        height: 28px;
    }
    .closePopDiv {
        font-size: 12px;
        margin-right: 2%;
        margin-top: 2%;
        padding: 0%;
        justify-content: right;
        align-items: right;
        text-align: right;
    }
    .confirmPopDiv {
        font-size: 16px;
        margin: 0%;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
    }


    .btnPop {
        margin: 0%;
        padding: 0%;
        background-color: transparent;
        border-radius: 5px;
        opacity: 0.5;
        color: white;
        border: none;
    }
    .btnPop:hover {
        transition: 1s;
        opacity: 1;
    }

    .modalBackground {
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
    }
    .itensInsideModal {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 625px;
        height: 300px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
    }
</style>
