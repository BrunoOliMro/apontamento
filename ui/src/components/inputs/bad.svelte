<script>
    // @ts-nocheck
    import Sanitize from '../../routes/sanitize.svelte';
    let title = 'RUINS:';
</script>

<div class='input-area'>
    <div class='title'>
        <p>{title}</p>
    </div>
    <div class='input-field'>
        <input tabindex='2' autofocus on:input={Sanitize} type='text' />
    </div>
</div>

<style>
    .input-area {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        height: fit-content;
        width: fit-content;
        padding: 0%;
        margin: 0%;
        font-size: 30px;
    }

    input {
        width: 115px;
        height: 40px;
        margin-left: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>
