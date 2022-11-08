<script>
// @ts-nocheck
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function message() {
        dispatch('message', {
			text: 'Hello!'
		});
    }
</script>

<div class="write" id="ruins" name="ruins">
    <p>RETRABALHAR</p>
    <input
        tabindex="2"
        autofocus
        on:click={message}
        class="input"
        id="reworkFeed"
        type="text"
        name="reworkFeed"
    />
</div>
