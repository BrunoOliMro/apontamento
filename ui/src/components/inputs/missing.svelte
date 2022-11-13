<script>
    let title = 'FALTANTE:';
</script>


<div class='input-area'>
    <div class='title'>
        <p>{title}</p>
    </div>
    <div class='input-field'>
        <input
            autofocus
            tabindex='3'
            class='input'
            id='missingFeed'
            type='text'
            name='missingFeed'
        />
    </div>
</div>

<style>
    .title{
        margin: 2%;
        padding: 0%
    }
    p{
        margin: 0%;
        padding: 0%;
    }
    .input-area {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        /* height: 10px; */
        width: fit-content;
        padding: 0%;
        margin: 0%;
        font-size: 30px;
    }

    input {
        width: 115px;
        height: 45px;
        margin-left: 0%;
        padding: 0%;
        border-radius: 8px;
    }
</style>