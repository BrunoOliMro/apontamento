<script>
    import { createEventDispatcher } from "svelte";
    export let titleInMessage;
    export let btnInMessage;
    export let subTitle;

    const dispatch = createEventDispatcher();
    
    async function redirect(event) {
        dispatch("message", {
            eventType: event,
            text: "Message Component!",
        });
    }
</script>

<div class="message-area">
    <h1 class="title">{titleInMessage}</h1>
    <h3 class="subTitle">{subTitle}</h3>
    <button class="btn" on:click={redirect} on:keypress={redirect}>{btnInMessage}</button>
</div>

<style>
    .title {
        font-size: 35px;
    }

    div{
        margin: 1%;
        padding: 0%;
    }

    .message-area {
        margin: 0%;
        padding: 0%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        letter-spacing: 1px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
    }

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
