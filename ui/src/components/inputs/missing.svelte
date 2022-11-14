<script>
    let title = 'FALTANTE';
</script>


<div class='input-area'>
    <div class='title'>
        <p>{title}</p>
    </div>
    <div class='input-field'>
        <input
            autofocus
            tabindex='3'
            type='text'
        />
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
        /* height: 10px; */
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