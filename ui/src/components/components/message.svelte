<script>
    import { createEventDispatcher } from "svelte";
    let message = "Error";
    const dispatch = createEventDispatcher();
    function redirect() {
        console.log("redirecionandoooo...");
        dispatch("message", {
            text: "Hello!",
        });
    }
</script>

<div>
    <h1 class="title">{message}</h1>
    <button on:click={redirect} on:keypress={redirect}>Voltar</button>
</div>

<style>
    .title {
        font-size: 35px;
    }
</style>
