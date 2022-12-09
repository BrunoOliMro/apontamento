<script>
    import blockForbiddenChars from "../../routes/presanitize";
    let title = "RETRABALHAR";
    let reworkFeed;

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    async function disa() {
        dispatch("message", {
            text: "reworkFeed!",
            reworkFeed,
        });
    }
</script>

<div class="input-area">
    <div class="title">
        <p>{title}</p>
    </div>
    <div class="input-field">
        <!-- svelte-ignore a11y-positive-tabindex -->
        <!-- svelte-ignore a11y-autofocus -->
        <input
            bind:value={reworkFeed}
            on:input={disa}
            on:input={blockForbiddenChars}
            tabindex="4"
            type="text"
        />
    </div>
</div>

<style>
    p {
        margin: 0%;
        padding: 0%;
        font-size: 37px;
    }
    .input-area {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: fit-content;
        height: fit-content;
        padding: 0%;
        margin: 0%;
    }

    input {
        width: 115px;
        height: 40px;
        margin: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
