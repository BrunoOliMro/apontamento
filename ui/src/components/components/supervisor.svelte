<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../utils/presanitize";
    import { createEventDispatcher } from "svelte";

    export let supervisor;
    export let titleSupervisor;
    export let subTitle = "";

    const dispatch = createEventDispatcher();

    async function makeRequest(event) {
        console.log('evente in supervisor', event.key);
            dispatch("message", {
                eventType: event,
                text: "Check for super",
            });
    }

    async function close(event) {
        console.log('evente in supervisor', event.key);
            dispatch("message", {
                eventType: event,
                text: "Go Back!!!",
            });
    }
</script>

<div class="background">
    <div class="modal-content">
        <h3>{titleSupervisor}</h3>

        <h4>{subTitle}</h4>

        <!-- on:keypress={makeRequest} -->
        <!-- on:keypress|preventDefault={makeRequest} -->
        <input
                autocomplete="off"
                autofocus
                on:input|preventDefault={blockForbiddenChars}
                bind:value={supervisor}
                onkeyup="this.value = this.value.toUpperCase()"
                type="text"
            />
            
        <!-- svelte-ignore a11y-positive-tabindex -->
        <button tabindex="20" on:click={makeRequest} on:keypress={makeRequest}
            >Confirmar</button
        >
        <button tabindex="20" on:click={close} on:keypress={close}
            >Voltar</button
        >
    </div>
</div>

<style>
    .background {
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
        z-index: 9999999;
    }
    .modal-content {
        color: white;
        background-color: black;
        width: 500px;
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 10px;
        z-index: 99999999999;
    }
    input {
        width: 300px;
        border-radius: 8px;
        z-index: 999999999999999999;
    }
</style>
