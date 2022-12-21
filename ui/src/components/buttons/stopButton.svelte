<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function messageDispatch() {
        dispatch("message", {
            text: "Hello!",
        });
    }
</script>

<!-- svelte-ignore a11y-positive-tabindex -->
<button
    tabindex="6"
    type="button"
    class="sideButton"
    on:click={messageDispatch}
    on:keypress={messageDispatch}
>
    Parada
</button>

<style>
    .sideButton {
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

    .sideButton:hover {
        outline: none;
        cursor: pointer;
        color: red;
        transition: all 1s;
    }
</style>
