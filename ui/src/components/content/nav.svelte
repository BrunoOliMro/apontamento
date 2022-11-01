<script>
// @ts-nocheck
    let imageLoader = '/images/axonLoader.gif';
    import badFeed from '../content/feed.svelte';
    import reworkFeed from '../content/feed.svelte';
    import missingFeed from '../content/feed.svelte';
    import ruins from '../content/feed.svelte';
    import retrabalhar from '../content/feed.svelte';
    import faltante from '../content/feed.svelte';
    import Title from '../title/title.svelte';
    let apiMotivoParada = 'api/v1/motivoParada';
    let postParada = `/api/v1/postParada`;
    let dadosOdf = [];
    let dados = [];
    let value = '';
    let showmodal = false;
    let resultCall = callMotivo();
    let showMaqPar = false;
    let ferr = localStorage.getItem("breadFer")

    const getMissingFeed = async () => {
        document.getElementById('faltante').style.display = 'block';
        document.getElementById('missingFeed').style.display = 'block';
        document.getElementById('retrabalhar').style.display = 'none';
        document.getElementById('ruins').style.display = 'none';
        document.getElementById('badFeed').style.display = 'none';
    };

    const getReworkFeed = async () => {
        document.getElementById('faltante').style.display = 'none';
        document.getElementById('retrabalhar').style.display = 'block';
        document.getElementById('reworkFeed').style.display = 'block';
        document.getElementById('ruins').style.display = 'none';
        document.getElementById('badFeed').style.display = 'none';
    };

    const getParcial = async () => {
        document.getElementById('faltante').style.display = 'none';
        document.getElementById('retrabalhar').style.display = 'none';
        document.getElementById('ruins').style.display = 'none';
        document.getElementById('badFeed').style.display = 'none';
    };
    function parada() {
        if (showmodal === false) {
            showmodal = true;
        } else {
            showmodal = false;
        }
    }

    function closeConfirm() {
        showMaqPar = false;
        showmodal = false;
        window.location.href = `/#/codigobarras`;
    }

    function closePop() {
        showMaqPar = false;
        if (showmodal === false) {
            showmodal = true;
        } else {
            showmodal = false;
        }
    }
    async function callMotivo() {
        const res = await fetch(apiMotivoParada);
        dados = await res.json();
        //console.log('dados Nav', dados);
    }

    const confirm = async () => {
        const headers = new Headers();
        const res = await fetch(postParada, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                value: value,
            }),
        }).then((res) => res.json());
        if (res.message === 'maquina parada com sucesso') {
            showMaqPar = true;
        }
    };
</script>

<main>
    {#if ferr === "true"}
        <nav class='breadcrumb' aria-label='breadcrumb'>
            <ol class='breadcrumb'>
                <li class='breadcrumb-item'>
                    <a href='/#/ferramenta'>Ferramentas</a>
                </li>
            </ol>
        </nav>
    {/if}

    <Title />
    <ul class='nav2'>
        <li>Parcial</li>
    </ul>

    {#await resultCall}
        <div class='imageLoader'>
            <div class='loader'>
                <img src={imageLoader} alt='' />
            </div>
        </div>
    {:then item}
        {#if showmodal === true}
            <div class='fundo'>
                <div class='header'>
                    <div class='closed'>
                        <h2>Motivo da Parada</h2>
                        <button
                            class='closebtn'
                            on:keypress={closePop}
                            on:click={closePop}>X</button
                        >
                    </div>
                    <select
                        autofocus
                        tabindex='10'
                        bind:value
                        name='id'
                        id='id'
                    >
                        {#each dados as item}
                            <option>{item}</option>
                        {/each}
                    </select>
                    <p tabindex='11' on:keypress={confirm} on:click={confirm}>
                        Confirmar
                    </p>
                </div>
            </div>
        {/if}
    {/await}

    {#if showMaqPar === true}
        <div class='fundo'>
            <div class='header'>
                <div class='closed'>
                    <h2>Maquina Parada</h2>
                    <button
                        class='closebtn'
                        autofocus
                        on:keypress={closeConfirm}
                        on:click={closeConfirm}
                    >
                        Confirma
                    </button>
                </div>
            </div>
        </div>
    {/if}
    <div class='nav'>
        <button
            on:click={getMissingFeed}
            on:keypress={getMissingFeed}
            type='button'
            class='sideButton'
            name='missing'
            >Faltante
        </button>
        <button
            on:click={getReworkFeed}
            on:keypress={getReworkFeed}
            type='button'
            class='sideButton'
            name='rework'
            >Retrabalhar
        </button>
        <a class='out' href='/#/rip/'
            ><button type='button' class='sideButton'>Inspeção</button></a
        >
        <a class='out' href='/#/historico/'
            ><button type='button' class='sideButton'> Historico </button>
        </a>
        <button
            type='button'
            class='sideButton'
            on:click={parada}
            on:keypress={parada}
        >
            Parada
        </button>
        <a class='out' href='/#/desenho/'
            ><button type='button' class='sideButton'>Desenho</button></a
        >
    </div>
</main>

<style>
    .breadcrumb{
        margin-top: 5px;
        margin-left: 0%;
        margin-bottom: 0%;
        text-decoration: underline;
    }
    .loader {
        margin: 0%;
        position: relative;
        width: 10vw;
        height: 5vw;
        padding: 1.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .imageLoader {
        margin: 0%;
        padding: 0%;
        position: fixed;
        top: 0;
        left: 0;
        background-color: black;
        height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .closebtn {
        width: 25px;
        border-radius: 5px;
    }
    h2 {
        width: 460px;
        justify-content: center;
        display: flex;
    }
    .closed {
        display: flex;
    }
    select {
        width: 200px;
        background-color: #252525;
        border-radius: 5px;
        color: #fff;
    }
    option {
        width: 35px;
        background-color: #252525;
    }
    p {
        display: flex;
        justify-content: center;
        text-decoration: none;
        padding: 5px;
        background: #252525;
        color: #fff;
    }

    .fundo {
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
    .header {
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 450px;
        height: 250px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 5px;
    }
    .out {
        text-decoration: none;
        outline: none;
    }
    a {
        text-decoration: none;
        outline: none;
    }
    a:focus {
        text-decoration: none;
        outline: none;
    }
    a:hover {
        text-decoration: none;
        outline: none;
    }
    .sideButton {
        outline: none;
        margin: 0%;
        padding: 0%;
        font-size: 14px;
        width: 120px;
        height: 35px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 3px;
        background-color: transparent;
        border: none;
        /* border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4); */
        letter-spacing: 1px;
    }

    .sideButton:hover {
        outline: none;
        cursor: pointer;
        background-color: black;
        color: white;
        transition: 1s;
    }
    .nav {
        margin: 0%;
        padding: 0%;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        background-color: transparent;
        border: none;
        /* border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4); */
    }

    @media screen and (max-width: 500px) {
        .nav2 {
            display: none;
        }
        .nav2 {
            display: none;
        }
    }
    @media screen and (min-width: 501px) {
        .nav2 {
            display: none;
        }
    }

    @media screen and (max-width: 820px) {
        .nav {
            display: none;
        }
        .nav2 {
            display: none;
        }
    }
    @media screen and (min-width: 821px) {
        .nav {
            margin-bottom: 15px;
            border-radius: 3px;
        }
        .nav2 {
            display: none;
        }
    }
</style>
