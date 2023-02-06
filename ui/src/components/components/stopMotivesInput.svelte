<script>
    import { createEventDispatcher } from "svelte";
    import blockForbiddenChars from "../../utils/presanitize";
    export let selectedValue;
    export let odfData;
    export let supervisor;
    export let titleToMotive;

    const dispatch = createEventDispatcher();

    async function checkForSuper(event) {
        if (event.key === "Enter" || event.type === 'click') {
            dispatch("message", {
                eventType: event,
                text: "Send",
                supervisor: supervisor,
            });
        }
    }

    async function close(event) {
        console.log('close');
        if (event.key === "Enter" || event.type === 'click') {
            dispatch("message", {
                eventType: event,
                text: "Close button in badFeedInput",
            });
        }
    }
</script>

<div class="background">
    <div class="header">
        <div class="closed">
            <h3>{titleToMotive}</h3>
        </div>
        <select bind:value={selectedValue}>
            {#each odfData.stopMotives.data ? odfData.stopMotives.data.map(e => e.DESCRICAO) : ['PARADA NÃO ESPERADA'] as item}
                <option>{item}</option>
            {/each}
        </select>
        <p>Supervisor</p>
        <input
            on:input={blockForbiddenChars}
            on:keypress={checkForSuper}
            bind:value={supervisor}
            autofocus
            class="supervisor"
            type="text"
            name="supervisor"
            id="supervisor"
        />
        <div class="modalFooter">
            <button on:keypress={close} on:click={close}>Fechar</button>
        </div>

        <div class="modalFooter">
            <button on:keypress={checkForSuper} on:click={checkForSuper}
                >Confirmar</button
            >
        </div>
    </div>
</div>

<style>
    .header {
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        width: 550px;
        height: 375px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 10px;
        z-index: 9;
    }
    .background {
        margin: 0%;
        padding: 0%;
        position: fixed;
        top: 0;
        left: 0;
        background-color: rgba(17, 17, 17, 0.618);
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        z-index: 8;
    }
</style>
