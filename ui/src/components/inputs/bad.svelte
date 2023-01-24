<script>
    import blockForbiddenChars from "../../utils/presanitize";
    let title = "RUINS";
    export let valueOfBadFeed;

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    async function callDispatch() {
        dispatch("message", {
            text: "badfeed!",
            badFeed: valueOfBadFeed,
        });
    }
</script>

<main>
    <div class="content">
        <div class="title">
            <p>{title}</p>
        </div>
        <div>
            <!-- svelte-ignore a11y-positive-tabindex -->
            <!-- svelte-ignore a11y-autofocus -->
            <input
                bind:value={valueOfBadFeed}
                on:input={callDispatch}
                on:input={blockForbiddenChars}
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
