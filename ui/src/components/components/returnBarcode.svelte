<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../utils/presanitize";
    import { createEventDispatcher } from "svelte";

    export let motiveToBind;
    export let motivesToBind;
    export let barcodeReturn;
    export let quantity;
    export let supervisor;
    export let valueStorage;

    const dispatch = createEventDispatcher();

    async function callDispatch(event) {
        dispatch("message", {
            eventType: event,
            text: "SendReturn!",
        });
    }

    async function callClose(event) {
        dispatch("message", {
            eventType: event,
            text: "CloseButton!",
        });
    }
</script>

<div class="background-modal">
    <div class="modal-div">
        <div class="line">
            <p>Código de barras da ODF:</p>
            <!-- svelte-ignore a11y-positive-tabindex -->
            <!-- svelte-ignore a11y-autofocus -->
            <input
                on:input={blockForbiddenChars}
                bind:value={barcodeReturn}
                autofocus
                autocomplete="off"
                class="return-input"
                onkeyup="this.value = this.value.toUpperCase()"
                type="text"
                tabindex="14"
            />
        </div>

        <div class="line">
            <p>Insira a quantidade que deseja estornar:</p>
            <!-- svelte-ignore a11y-positive-tabindex -->
            <input
                on:input={blockForbiddenChars}
                bind:value={quantity}
                autocomplete="off"
                class="return-input"
                onkeyup="this.value = this.value.toUpperCase()"
                type="text"
                tabindex="15"
            />
        </div>

        <div class="line">
            <p>Crachá do Supervisor:</p>
            <!-- svelte-ignore a11y-positive-tabindex -->
            <input
                bind:value={supervisor}
                on:input={blockForbiddenChars}
                autocomplete="off"
                tabindex="16"
                class="return-input"
                onkeyup="this.value = this.value.toUpperCase()"
                type="text"
            />
        </div>

        <div class="line">
            <p>Qual irá retornar:</p>
            <div class="options">
                <!-- svelte-ignore a11y-positive-tabindex -->
                <select tabindex="17" bind:value={valueStorage}>
                    <option>BOAS</option>
                    <option>RUINS</option>
                </select>
            </div>
        </div>

        <div class="line">
            <p>Qual o motivo do estorno:</p>
            <select bind:value={motiveToBind}>
                {#each motivesToBind as item}
                    <option>{item}</option>
                {/each}
            </select>
        </div>

        <div class="line-btn">
            <!-- svelte-ignore a11y-positive-tabindex -->
            <p
                tabindex="19"
                on:keypress|preventDefault={callClose}
                on:click|preventDefault={callClose}
            >
                Fechar
            </p>
            <!-- svelte-ignore a11y-positive-tabindex -->
            <p
                tabindex="18"
                on:keypress|preventDefault={callDispatch}
                on:click|preventDefault={callDispatch}
            >
                Confirmar
            </p>
        </div>
    </div>
</div>
