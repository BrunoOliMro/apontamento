<script>
    // @ts-nocheck
    import Sanitize from '../../routes/sanitize.svelte'
    let title = "BOAS";
</script>

<div class="input-area">
    <div class="title">
        <p>{title}</p>
    </div>
    <div class="input-field">
        <!-- on:input={Sanitize}  -->
        <input tabindex="1" autofocus 
        type="text" />
    </div>
</div>

<style>
    p{
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
