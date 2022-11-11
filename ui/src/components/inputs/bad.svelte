<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../routes/functions.svelte";
</script>

<div class="write">
    <div class="title">
        <p>RUINS: </p>
    </div>
    <div>
        <input
            tabindex="2"
            autofocus
            on:input={blockForbiddenChars}
            class="input"
        />
    </div>
</div>

<style>
    p{
        margin: 0%;
        padding: 0%;
    }

    .title{
        margin: 2%;
    }
    .write {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        /* height: 10px; */
        width: fit-content;
        padding: 0%;
        margin: 0%;
        font-size: 30px;
    }

    input {
        width: 115px;
        height: 40px;
        margin-left: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
