<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../utils/presanitize";
    import { createEventDispatcher } from "svelte";

    let title = "BOAS";
    export let goodFeed;

    const dispatch = createEventDispatcher();

    async function callDispatch(event) {
        if (event.key === "Enter") {
            dispatch("message", {
                eventType: event,
                text: "Send",
                goodFeed: goodFeed,
            });
        }
    }
</script>

<div class="content">
    <div class="title">
        <p>{title}</p>
    </div>
    <div>
        <!-- svelte-ignore a11y-positive-tabindex -->
        <!-- svelte-ignore a11y-autofocus -->
        <!-- on:input={callDispatch} -->
        <input
            on:input={blockForbiddenChars}
            on:keypress={callDispatch}
            bind:value={goodFeed}
            tabindex="1"
            autofocus
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
        font-weight: 500;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin: 0%;
        padding: 0%;
        height: fit-content;
        width: fit-content;
    }

    input {
        width: 105px;
        height: 40px;
        margin: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
