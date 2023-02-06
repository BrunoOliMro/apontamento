<script>
    import blockForbiddenChars from "../../utils/presanitize";
    import { createEventDispatcher } from "svelte";

    let title = "RETRABALHADAS";
    export let reworkFeed;

    const dispatch = createEventDispatcher();

    async function callDispatch(event) {
        if (event.key === "Enter") {
            dispatch("message", {
                eventType: event,
                text: "Send",
                reworkFeed: reworkFeed,
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
        <!-- on:input={callDispatch} -->
        <input
            on:input={blockForbiddenChars}
            on:keypress={callDispatch}
            bind:value={reworkFeed}
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
        font-weight: 500;
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
        width: 105px;
        height: 40px;
        margin: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
