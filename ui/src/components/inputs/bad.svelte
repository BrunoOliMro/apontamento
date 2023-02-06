<script>
    import blockForbiddenChars from "../../utils/presanitize";
    import { createEventDispatcher } from "svelte";

    let title = "RUINS";
    export let valueOfBadFeed;

    const dispatch = createEventDispatcher();

    async function callDispatch(event) {
        if (event.key === "Enter") {
            dispatch("message", {
                eventType: event,
                text: "Send",
                badFeed: valueOfBadFeed,
            });
        }
    }
</script>

<main>
    <div class="content">
        <div class="title">
            <p>{title}</p>
        </div>
        <div>
            <input
                on:input={blockForbiddenChars}
                bind:value={valueOfBadFeed}
                on:keypress={callDispatch}
                tabindex="2"
                type="text"
            />
        </div>
    </div>
</main>

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
        height: fit-content;
        width: fit-content;
        padding: 0%;
        margin: 0%;
    }

    input {
        width: 105px;
        height: 40px;
        margin-left: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
