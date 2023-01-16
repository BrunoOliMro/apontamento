<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../utils/presanitize";
    import { createEventDispatcher } from "svelte";
    export let titleInput;
    export let valueToBind;

    const dispatch = createEventDispatcher();

    async function callDispatch(event) {
        dispatch("message", {
            eventType: event,
            text: "InputArea!",
        });
    }
</script>

<div>
    <div class="form-div">
        <div id="pop-up-badge">
            <div id="title">{titleInput}</div>
            <input
                autocomplete="off"
                autofocus
                on:keypress={callDispatch}
                on:input|preventDefault={blockForbiddenChars}
                onkeyup="this.value = this.value.toUpperCase()"
                type="text"
                bind:value={valueToBind}
            />
        </div>
    </div>
</div>

<style>
    input {
        border-radius: 10px;
    }

    .form-div {
        height: 180px;
        letter-spacing: 1px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
    }

    #pop-up-badge {
        margin: 1%;
        padding: 0%;
        padding: 15px;
        height: 180px;
        font-size: 35px;
        border-radius: 5px;
        color: black;
        justify-content: center;
        text-align: center;
        align-items: center;
    }
</style>
