<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../routes/functions.svelte";
</script>

<div class="write" id="ruins" name="ruins">
    <p>RUINS</p>
    <input
        tabindex="2"
        autofocus
        on:input={blockForbiddenChars}
        class="input"
    />
</div>

<style>
    p{
        margin: 0%;
        padding: 0%;
    }
    .write {
        height: 10px;
        width: fit-content;
        padding: 0%;
        margin: 0%;
        /* padding: 0px 30px; */
        font-size: 52px;
    }

    input {
        width: 130px;
        height: 50px;
        margin: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
