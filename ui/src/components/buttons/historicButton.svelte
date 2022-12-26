<!-- svelte-ignore a11y-positive-tabindex -->
<a class="out" href="/#/historico/"
    ><button tabindex="7" type="button" class="btn">
        <p>Histórico de apontamento</p>
    </button>
</a>

<style>
    a {
        text-decoration: none;
        /* color: black; */
    }

    p{
        font-size: 20px;
        margin: 0%;
        padding: 0%;
    }

    .btn {
        outline: none;
        margin: 0%;
        padding: 0%;
        width:300px;
        height: 30px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 6px;
        background-color: white;
        border: none;
        color: black;
        border-color: #999999;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        letter-spacing: 1px;
    }

    .btn:hover {
        cursor: pointer;
        background-color: white;
        color: blue;
        transition: all 1s;
    }

    a:hover {
        text-decoration: none;
    }
</style>
