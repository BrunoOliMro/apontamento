<script>
    export let machineStop;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function messageDispatch() {
        dispatch("message", {
            text: "Hello!",
        });
    }
</script>

<!-- svelte-ignore a11y-positive-tabindex -->
{#if machineStop === true}
    <button
        tabindex="6"
        type="button"
        class="btn-Stop"
        on:click={messageDispatch}
        on:keypress={messageDispatch}
    >
        Máquina parada
    </button>
{:else}
    <button
        tabindex="6"
        type="button"
        class="btn"
        on:click={messageDispatch}
        on:keypress={messageDispatch}
    >
        Parada
    </button>
{/if}

<style>
    .btn-Stop{
        outline: none;
        margin: 0%;
        padding: 0%;
        font-size: 20px;
        width: 200px;
        height: 30px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 6px;
        background-color: white;
        border: none;
        color: red;
        border-color: #999999;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        letter-spacing: 1px;
    }

    .btn {
        outline: none;
        margin: 0%;
        padding: 0%;
        font-size: 20px;
        width: 120px;
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
        outline: none;
        cursor: pointer;
        color: red;
        transition: all 1s;
    }
</style>
