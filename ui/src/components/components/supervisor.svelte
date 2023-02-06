<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../utils/presanitize";
    import { createEventDispatcher } from "svelte";

    export let supervisor = "";
    export let titleSupervisor = "";
    export let subTitle = "";

    const dispatch = createEventDispatcher();

    async function makeRequest(event) {
        console.log('Make Request: ', event);
        if (event.key === "Enter" || event.type === "click") {
            dispatch("message", {
                eventType: event,
                text: "Check for super",
            });
        }
    }

    async function close(event) {
        dispatch("message", {
            eventType: event,
            text: "Go Back!!!",
        });
    }
</script>

<div class="background">
    <div class="modal-content">
        <h3 class="title-supervisor">{titleSupervisor}</h3>

        <h4 class="subTitle-supervisor">{subTitle}</h4>

        <!-- svelte-ignore a11y-autofocus -->
        <input
            autocomplete="off"
            autofocus
            on:input|preventDefault={blockForbiddenChars}
            on:keypress={makeRequest}
            bind:value={supervisor}
            onkeyup="this.value = this.value.toUpperCase()"
            type="text"
        />
        <!-- svelte-ignore a11y-positive-tabindex -->
        <div class="line-btn">
            <button
                tabindex="3"
                class="btn"
                on:click={close}
                on:keypress={close}>Voltar</button
            >
            <button
                class="btn"
                tabindex="20"
                on:click={makeRequest}
                on:keypress={makeRequest}>Confirmar</button
            >
        </div>
    </div>
</div>

<style>
    .title-supervisor {
        font-size: 45px;
        margin: 1%;
        padding: 0%;
    }
    .subTitle-supervisor {
        font-size: 32px;
        margin: 1%;
        padding: 0%;
    }
    .btn {
        font-size: 20px;
        margin: 1%;
        padding: 0%;
        width: 200px;
        height: 32px;
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        border-radius: 10px;
        background-color: #fff;
        border: none;
        letter-spacing: 1px;
        box-shadow: grey;
        color: #252525;
    }

    .btn:hover {
        background-color: #fff;
        transition: all 0.7s;
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
    h3 {
        font-size: 35px;
    }
    h4 {
        font-size: 30px;
    }
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
        background-color: #252525;
        width: 600px;
        height: 350px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 10px;
        z-index: 99999999999;
    }
    input {
        padding: 0%;
        margin: 1%;
        width: 320px;
        height: 35px;
        border-radius: 10px;
        z-index: 999999999999999999;
    }
</style>
