<script>
    export let title = "Maquina Parada";

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function confirma() {
        dispatch("message", {
            text: "teste basso cabaço",
        });
    }
</script>

<div class="modalBackground">
    <div class="confirmationModal">
        <div class="onlyConfirmModalContent">
            <h2 class="modalTitle">{title}</h2>
            <div class="onlyConfirmPop">
                <button
                    autofocus
                    class="btnPopConfirm"
                    id="confirmPop"
                    on:click={confirma}
                >
                    CONFIRMAR
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    .confirmationModal {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 550px;
        height: 250px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
    }
    .onlyConfirmModalContent {
        margin-top: 50px;
        margin-bottom: 0%;
        margin-left: 25px;
        margin-right: 0%;
        padding: 0%;
    }
    .onlyConfirmPop {
        justify-content: right;
        margin-right: 1%;
        align-items: right;
        text-align: right;
    }
    .btnPopConfirm {
        border: none;
        background-color: transparent;
        color: white;
    }
    button {
        letter-spacing: 0.5px;
        width: fit-content;
        height: 28px;
    }
    .modalTitle {
        margin-left: 0px;
        margin-bottom: 25px;
        margin-right: 0px;
        margin-top: 0px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
    }

    h2 {
        font-size: 55px;
        margin: 0px, 0px, 0px, 0px;
        padding: 0px;
        width: 550px;
        align-items: left;
        text-align: left;
        justify-content: left;
        display: flex;
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
</style>
