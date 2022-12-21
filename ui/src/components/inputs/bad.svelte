<script>
    import blockForbiddenChars from "../../routes/presanitize";
    let title = "RUINS";
    let badFeed;

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    async function callDispatch() {
        dispatch("message", {
            text: "badfeed!",
            badFeed,
        });
    }
</script>

<main>
    <div class="input-area">
        <div class="title">
            <p>{title}</p>
        </div>
        <div class="input-field">
            <!-- svelte-ignore a11y-positive-tabindex -->
            <!-- svelte-ignore a11y-autofocus -->
            <input
                bind:value={badFeed}
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
    .input-area {
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
        width: 115px;
        height: 40px;
        margin-left: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
