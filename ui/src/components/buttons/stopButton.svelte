<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function messageDispatch() {
        console.log("linha 5 /rework Btn /");
        dispatch("message", {
            text: "Hello!",
        });
    }
</script>

<button type="button" class="sideButton" on:click={messageDispatch} on:keypress={messageDispatch}>
    Parada
</button>


<style>
    .sideButton {
        outline: none;
        margin: 0%;
        padding: 0%;
        font-size: 14px;
        width: 120px;
        height: 30px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 6px;
        background-color: #999999; 
        border: none;
        color: black;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        letter-spacing: 1px;
    }

    .sideButton:hover {
        outline: none;
        cursor: pointer;
        background-color: black;
        color: red;
        transition: all 1s;
    }
</style>
