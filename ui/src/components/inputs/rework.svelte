<script>
    import blockForbiddenChars from "../../utils/presanitize";
    let title = "RETRABALHAR";
    export let reworkFeed;

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    async function callDispatch() {
        dispatch("message", {
            text: "reworkFeed!",
            reworkFeed: reworkFeed,
        });
    }
</script>

<div class="content">
    <div class="title">
        <p>{title}</p>
    </div>
    <div>
        <!-- svelte-ignore a11y-positive-tabindex -->
        <!-- svelte-ignore a11y-autofocus -->
        <input
            bind:value={reworkFeed}
            on:input={callDispatch}
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
    .content {
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
