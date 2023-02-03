<script>
    import { createEventDispatcher } from "svelte";
    export let titleInMessage;
    export let btnInMessage;
    export let subTitle = ``;

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
    <!-- svelte-ignore a11y-autofocus -->
    <button class="btn" autofocus on:click={redirect} on:keypress={redirect}>{btnInMessage}</button>
</div>

<style>
    .title {
        font-size: 55px;
        margin: 2%;
        padding: 0%;
    }

    div{
        margin: 1%;
        padding: 0%;
    }

    .message-area {
        width: 98%;
        height: 600px;
        margin: 1%;
        padding: 0%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        letter-spacing: 1px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        border-radius: 10px;
    }

    .btn {
        outline: none;
        margin: 0%;
        padding: 0%;
        width: 300px;
        height: 35px;
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
        background-color: black;
        color: white;
        transition: 1s;
    }
</style>
