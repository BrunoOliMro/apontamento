<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function messageDispatch() {
        dispatch("message", {
            text: "Hello!",
        });
    }
</script>

<button
    on:click={messageDispatch}
    type="button"
    class="sideButton"
    name="missing"
    >Faltante
</button>

<style>
    .sideButton {
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
        /* border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4); */
        letter-spacing: 1px;
    }

    .sideButton:hover {
        outline: none;
        cursor: pointer;
        background-color: black;
        color: white;
        transition: 1s;
    }
</style>
