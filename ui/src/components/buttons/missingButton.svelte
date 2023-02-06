<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function message() {
        dispatch("message", {
            text: "Hello!",
        });
    }
</script>

<button on:click={message} type="button" class="btn">Faltante </button>

<style>
    .btn {
        outline: none;
        margin: 0%;
        padding: 0%;
        font-size: 14px;
        width: 120px;
        height: 35px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 3px;
        background-color: transparent;
        border: none;
        letter-spacing: 1px;
    }

    .btn:hover {
        outline: none;
        cursor: pointer;
        background-color: black;
        color: white;
        transition: 1s;
    }
</style>
