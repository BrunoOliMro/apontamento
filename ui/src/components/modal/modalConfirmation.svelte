<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let btnTitle = 'Fechar';
    export let title = "";
    
    function callDispatch() {
        dispatch("message", {
            text: "teste basso cabaço",
        });
    }
</script>

<div class="background">
    <div class="modal-content">
        <div class="content">
            <hr />
            <h2 class="modal-title">{title}</h2>
            <div class="div-btn">
                <hr />
                <!-- svelte-ignore a11y-autofocus -->
                <button autofocus class="btn" on:click={callDispatch}>
                    {btnTitle}
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    hr {
        margin: 2%;
        padding: 0%;
        color: white;
    }
    .modal-content {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 650px;
        height: 250px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 14px;
    }
    .content {
        margin-top: 50px;
        margin-bottom: 0%;
        margin-left: 0px;
        margin-right: 0%;
        padding: 0%;
    }
    .div-btn {
        justify-content: right;
        margin-right: 1%;
        align-items: right;
        text-align: right;
    }
    .btn {
        border-color: transparent;
        border: none;
        background-color: white;
        color: #252525;
    }
    button {
        border-color: transparent;
        border: none;
        transition: all 0.5s;
        margin-right: 2%;
        padding: 0%;
        letter-spacing: 0.5px;
        width: 200px;
        height: 28px;
        border-radius: 8px;
    }
    
    button:hover {
        border: none;
        border-color: transparent;
        background-color: white;
        color: black;
        box-shadow: 0 0 2.5px rgb(216, 208, 208), 0 0 12.5px rgb(216, 208, 208), 0 0 25px rgb(216, 208, 208),
            0 0 1px rgb(216, 208, 208);
    }

    .modal-title {
        margin-left: 0px;
        margin-bottom: 25px;
        margin-right: 0px;
        margin-top: 0px;
        padding: 0%;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    h2 {
        font-size: 52px;
        margin: 0px, 0px, 0px, 0px;
        padding: 0px;
        /* width: 600px; */
        align-items: left;
        text-align: left;
        justify-content: left;
        display: flex;
    }
    .background {
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
</style>
