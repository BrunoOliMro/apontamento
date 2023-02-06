<script>
    // @ts-nocheck
    import blockForbiddenChars from "../../utils/presanitize";
    export let dados;
    export let indice;
    export let extraColumns;
    export let values;
    export let valuesObj = {
        LIE: dados.LIE,
        LSE: dados.LSE,
        setup: '',
        M2: '',
        M3: '',
        M4: '',
        M5: '',
        M6: '',
        M7: '',
        M8: '',
        M9: '',
        M10: '',
        M11: '',
        M12: '',
        M13: '',
    };
    export let setup = {};
    let id = '';
    // let allowedChars = /[KOko0-9.,]/;
    let errUser = '';

    function checkColor(event) {
        //console.log('linha 30', event);
        let userInputValue = event.target.value;
        let lie = dados.LIE;
        let lsd = dados.LSE;

        if (lie === null && lsd === null) {
            lie = 'OK';
            lsd = 'OK';
        }

        userInputValue = userInputValue.toUpperCase();
        //console.log('values', valuesObj);

        if (userInputValue.length > 2 && lie === 'OK' &&lsd === 'OK' &&userInputValue !== 'OK') {
            valuesObj = ''
            errUser = 'usuario inseriu caracteres demais';
        } else {
            if (userInputValue < lie && userInputValue.length !== 0) {
                event.target.style.borderColor = 'red';
            } else if (userInputValue > lsd && userInputValue.length !== 0) {
                event.target.style.borderColor = 'red';
            } else if (
                userInputValue >= lie &&
                userInputValue <= lsd &&
                userInputValue.length !== 0
            ) {
                event.target.style.borderColor = 'green';
            } else if (
                userInputValue.length <= 0 ||
                (userInputValue === '' && userInputValue !== 'OK')
            ) {
                event.target.style.borderColor = 'black';
            }
            if (userInputValue !== 'OK' && lie === 'OK' && lsd === 'OK') {
                event.target.style.borderColor = 'black';
            }

            if (userInputValue === 'OK' && lie === 'OK' && lsd === 'OK') {
                event.target.style.borderColor = 'green';
            }
        }
    }

    function target(event) {
        id = event.target.id;
        values = event.target.value;
        setup[id] = values;
    }

    function close() {
        errUser = '';
    }
</script>

<tr class='tabelahistorico'>
    <td>{indice}</td>
    <td>{dados.NUMPEC === null || !dados.NUMPEC ? 'S/I' : dados.NUMPEC}</td>
    <td>{dados.DESCRICAO === null ? 'S/I' : dados.DESCRICAO}</td>
    <td>{dados.ESPECIF === null || !dados.ESPECIF ? 'S/I' : dados.ESPECIF}</td>
    <td id={'LIE-' + indice}>{dados.LIE === null ? 'S/I' : dados.LIE}</td>
    <td id={'LSE-' + indice}>{dados.LSE === null ? 'S/I' : dados.LSE}</td>
    <td>{dados.INSTRUMENTO === null ? 'S/I' : dados.INSTRUMENTO}</td>
    <td>
        <input
            on:input={target}
            on:input={checkColor}
            on:input={blockForbiddenChars}
            bind:value={valuesObj['setup']}
            onkeyup='this.value = this.value.toUpperCase()'
            id={'SETUP-' + indice}
            name={'SETUP-' + indice}
            type='text'
        /></td
    >
    {#each extraColumns as columnNumber}
        <td>
            <input
                on:input={checkColor}
                onkeyup='this.value = this.value.toUpperCase()'
                on:input={target}
                on:input={blockForbiddenChars}
                bind:value={valuesObj['M' + columnNumber]}
                id={'M' + columnNumber + '-' + indice}
                name={'M' + columnNumber + '-' + indice}
                type='text'
            />
        </td>
    {/each}
</tr>

{#if errUser === 'usuario inseriu caracteres demais'}
    <div class="modalBackground" >
        <div class="confirmationModal">
            <div class="onlyConfirmModalContent">
                <h2 class="modalTitle">Limite de caracteres</h2>
                <div class="onlyConfirmPop">
                    <!-- svelte-ignore a11y-positive-tabindex -->
                    <button
                        class="btnPopConfirm"
                        id="confirmPop"
                        tabindex="11"
                        on:keypress={close}
                        on:click={close}
                    >
                        CONFIRMAR
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .btnPopConfirm{
        color: white;
        border: none;
        background-color: transparent;
    }
    h2 {
        font-size: 45px;
        margin: 0px, 0px, 0px, 0px;
        padding: 0px;
        width: 460px;
        align-items: left;
        text-align: left;
        justify-content: left;
        display: flex;
    }
    .modalBackground {
        transition: 1s;
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
        z-index: 999999999999999999999999999999;
    }
    .modalTitle {
        margin-left: 0px;
        margin-bottom: 25px;
        margin-right: 0px;
        margin-top: 0px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
    }
    .confirmationModal{
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 470px;
        height: 225px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
    }
    .onlyConfirmModalContent{
        margin-top: 50px;
        margin-bottom: 0%;
        margin-left: 25px;
        margin-right: 0%;
        padding: 0%;

    }
    .onlyConfirmPop{
        justify-content: right;
        margin-right: 1%;
        align-items: right;
        text-align: right;
    }
    /* .fundo {
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
    }
    .header {
        color: white;
        background-color: black;
        width: 500px;
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 3px;
    } */
    
    *:focus {
        outline: none;
    }
    .tabelahistorico {
        /* width: 100px; */
        background-color: white;
    }
    tr {
        background-color: white;
        text-align: center;
        letter-spacing: 1px;
    }
    td {
        /* width: 100%; */
        vertical-align: middle;
        align-items: center;
        background-color: white;
    }
    input {
        border-color: black;
        width: 80px;
        border-radius: 8px;
    }
</style>
