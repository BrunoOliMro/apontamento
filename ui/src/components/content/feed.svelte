<script>
    import { onMount } from "svelte";

    let goodFeed;
    let badFeed;
    let missingFeed;
    let reworkFeed;
    let parcialFeed;
    let urlS = `/api/v1/apontar`;
    let urlString = `/api/v1/odf`;
    let motivoUrl = "/api/vi/motivoRefugo";
    let dadosOdf = [];
    let dados = [];

    let apontamentoMsg = "";
    if (window.location.href.includes("?")) {
        apontamentoMsg = window.location.href.split("?")[1].split("=")[1];
    }

    async function getOdfData() {
        const res = await fetch(urlString);
        dadosOdf = await res.json();
    }

    const doPost = async () => {
        const headers = new Headers();
        console.log(goodFeed);
        const res = await fetch(urlS, {
            method: "POST",
            body: JSON.stringify({
                goodFeed: goodFeed,
                badFeed: badFeed,
                reworkFeed: reworkFeed,
                missingFeed: missingFeed,
                parcialFeed: parcialFeed,
            }),
            headers,
        });
    };
    let resultado = getOdfData();

    onMount(async () => {
        const res = await fetch(motivoUrl);
        dados = await res.json();
        console.log(dados)
    });
</script>

{#await resultado}
    <div>...</div>
{:then itens}
    <main id="main" class="align-self-center">
        {#if dadosOdf.length !== 0}
            <form action="/api/v1/apontar" method="POST">
                <div class="write">Produzir {dadosOdf[0].QTDE_ODF[0]}</div>
                <div class="write" id="goodFeed">
                    Boas
                    <input class="input" name="goodFeed" />
                </div>
                <div class="write" id="ruins" name="ruins">
                    Ruins
                    <input class="input" name="badFeed" />
                </div>
                <div class="write" id="retrabalhar">
                    Retrabalhar
                    <input class="input" type="text" name="reworkFeed" />
                </div>
                <div class="write" id="parcialFeed">
                    Parcial
                    <input class="input" type="text" name="parcial" />
                </div>
                <div class="write" id="faltante">
                    Faltante
                    <input class="input" type="text" name="missingFeed" />
                </div>
                <button
                    id="button"
                    on:click={doPost}
                    type="submit"
                    class="sideButton">Apontar</button
                >
            </form>

            {#if 1 === 1}
                <div class="fundo">
                    <div class="header">
                        <p>MOTIVO DO REFUGO</p>
                        {#each dados as item}
                            {item}
                        {/each}
                        <p>Confirmar</p>
                    </div>
                </div>
            {/if}
        {/if}
    </main>
{/await}

<style>
    .header {
        color: white;
        background-color: black;
        width: 500px;
        height: 300px;
        /* position: absolute;
        top: 20%;
        left: 40%; */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 3px;
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
    }
    .apontarInvalido {
        color: white;
        background-color: black;
        width: 500px;
        height: 250px;
        position: absolute;
        top: 20%;
        left: 40%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 3px;
    }
    .sideButton {
        margin: 1%;
        padding: 0%;
        font-size: 14px;
        width: 100px;
        height: 220px;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        border-radius: 3px;
        background-color: transparent;
    }

    .sideButton:hover {
        outline: none;
        cursor: pointer;
        background-color: black;
        color: white;
        transition: 1s;
    }
    #parcialFeed {
        display: none;
    }
    main {
        font-size: 55px;
        justify-content: center;
        align-items: center;
        text-align: center;
        display: flex;
        font-weight: bold;
    }

    input {
        width: 200px;
    }

    form {
        display: flex;
    }

    #retrabalhar {
        display: none;
    }

    #faltante {
        display: none;
    }

    @media screen and (max-width: 574px) {
        .write {
            font-size: 20px;
        }
        .input {
            width: 55px;
        }
        #main {
            margin-top: 5%;
            margin-left: 0px;
            margin-right: 0px;
            padding: 0px;
        }
        div {
            margin: 2%;
        }
    }

    @media screen and (min-width: 575px) {
        .write {
            font-size: 30px;
        }
        .input {
            width: 90px;
        }
        #main {
            margin-top: 5%;
        }
        div {
            margin: 1%;
        }
    }
    @media screen and (min-width: 860px) {
        .write {
            font-size: 28px;
        }
        .input {
            width: 100px;
        }
    }

    @media screen and (min-width: 1000px) {
        .write {
            font-size: 30px;
        }
        .input {
            width: 90px;
        }
        div {
            margin: 1%;
        }
        #main {
            margin: 0%;
            padding: 0%;
        }
    }
    @media screen and (min-width: 1200px) {
        .write {
            font-size: 35px;
        }

        .input {
            width: 120px;
        }
        div {
            margin: 1%;
        }
    }
    @media screen and (min-width: 1400px) {
        .write {
            font-size: 45px;
        }

        .input {
            width: 150px;
        }
        div {
            margin: 1%;
        }
    }

    @media screen and (min-width: 1600px) {
        .input {
            width: 200px;
        }
        .write {
            font-size: 55px;
        }
        #main {
            display: flex;
            flex-direction: row;
            justify-content: start;
            font-weight: bold;
            align-items: flex-start;
            height: 100%;
            margin: 0;
        }
    }
</style>
