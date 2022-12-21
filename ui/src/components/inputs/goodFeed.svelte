<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../routes/presanitize";
    let title = "BOAS";
    let goodFeed;

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    async function callDispatch(event) {
        if(event.key === 'Enter'){
            dispatch('submit', {
                text: 'Manda pae',
                goodFeed
            })
        } else {
            dispatch("message", {
                text: "goodFeed!",
                goodFeed,
            });
        }
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
            on:keypress={callDispatch}
            bind:value={goodFeed}
            on:input={callDispatch}
            on:input={blockForbiddenChars}
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
    .input-area {
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
        width: 115px;
        height: 40px;
        margin: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
