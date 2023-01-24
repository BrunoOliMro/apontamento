<script>
    // @ts-nocheck

    import blockForbiddenChars from "../../utils/presanitize";
    import { createEventDispatcher } from "svelte";

    export let barcodeAddress;
    export let supervisorToCallAddress;
    const dispatch = createEventDispatcher();

    async function redirect(event) {
        dispatch("message", {
            eventType: event,
            text: "Me mostras esse endereço ai",
        });
    }

    async function otherMessage(event) {
        dispatch("message", {
            eventType: event,
            text: "O cracha do supervisor",
        });
    }

    async function closeModal(event) {
        dispatch("message", {
            eventType: event,
            text: "Close modal call view address",
        });
    }

    async function sendData(event) {
        dispatch("message", {
            eventType: event,
            text: "Give me addresss",
        });
    }
</script>

<div>
    <div class="line">
        <p>Código de barras da odf:</p>
        <input
            on:keypress={redirect}
            on:input|preventDefault={blockForbiddenChars}
            onkeyup="this.value = this.value.toUpperCase()"
            type="text"
            on:click={redirect}
            bind:value={barcodeAddress}
        />
    </div>
    <div class="line">
        <p>Supervisor:</p>
        <input
            on:keypress={otherMessage}
            on:input|preventDefault={blockForbiddenChars}
            onkeyup="this.value = this.value.toUpperCase()"
            on:click={otherMessage}
            type="text"
            bind:value={supervisorToCallAddress}
        />
    </div>

    <div class="line-btn">
        <button class="btn" on:click={closeModal} on:keypress={closeModal}
            >Fechar</button
        >

        <button class="btn" on:click={sendData} on:keypress={sendData}
            >Confirmar</button
        >
    </div>
</div>

<style>
    .line {
        margin: 1%;
        padding: 0%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        text-align: center;
        align-items: center;
    }

    .line-btn {
        display: flex;
        margin: 1%;
        padding: 0%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        text-align: center;
    }

    input {
        border-radius: 8px;
        width: 300px;
        height: 40px;
        margin: 0%;
        padding: 0%;
        font-weight: 500;
        text-align: center;
        justify-content: center;
        align-items: center;
    }

    p {
        margin: 1%;
        padding: 0%;
        font-size: 35px;
        font-weight: 500;
    }

    .btn {
        font-size: 22px;
        margin: 1%;
        padding: 0%;
        width: 275px;
        height: 35px;
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        border-radius: 10px;
        background-color: transparent;
        border: none;
        letter-spacing: 1px;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        color: black;
    }

    .btn:hover {
        color: #fff;
        background-color: #252525;
        transition: all 0.7s;
    }
</style>
