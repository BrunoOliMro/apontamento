<script>
    let odfData;
    console.log('odfData linha 3 viewAddress.svelte', odfData)
    export let addressOut;
    export let addressIn;
</script>

<div class="address-area">
    <div>
        Endereço de saída: {addressOut}
    </div>
    <div>
        Endreço de entrada: {addressIn}
    </div>
</div>


<style>
    .address-area{
        margin: 1%;
        padding: 0%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        align-items: center;
    }
</style>