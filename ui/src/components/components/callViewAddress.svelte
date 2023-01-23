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
    Código de barras da odf deseja buscar:
    <input
        on:keypress={redirect}
        on:input|preventDefault={blockForbiddenChars}
        onkeyup="this.value = this.value.toUpperCase()"
        type="text"
        on:click={redirect}
        bind:value={barcodeAddress}
    />

    Supervisor:
    <input
        on:keypress={otherMessage}
        on:input|preventDefault={blockForbiddenChars}
        onkeyup="this.value = this.value.toUpperCase()"
        on:click={otherMessage}
        type="text"
        bind:value={supervisorToCallAddress}
    />

    <button on:click={sendData} on:keypress={sendData}>Confirmar</button>

    <button on:click={closeModal} on:keypress={closeModal}>Fechar</button>
</div>

<style>
</style>
