<script>
    let feed;
    let badFeed;
    let missingFeed;
    let reworkFeed;
    let parcialFeed;
    let urlS = `/api/v1/apontar`;
    let urlString = `/api/v1/odf`;
    let motivoUrl = `/api/v1/motivorefugo`;
    let dadosOdf = [];
    let dados = [];
    let showConfirm = false;

    let apontamentoMsg = "";
    if (window.location.href.includes("?")) {
        apontamentoMsg = window.location.href.split("?")[1].split("=")[1];
    }

    async function getOdfData() {
        const res = await fetch(urlString);
        dadosOdf = await res.json();
    }

    const doPost = async () => {
        //showConfirm = true;
        const headers = new Headers();
        console.log(feed);
        const res = await fetch(urlS, {
            method: "POST",
            body: JSON.stringify({
                feed: feed,
            }),
            headers,
        });
    };

    function blockForbiddenChars(e) {
        let value = e.target.value;
        e.target.value = preSanitize(value);
    }

    // /**
    //  * @param {string} input
    //  */
    function preSanitize(input) {
        const allowedChars = /[0-9]/;
        const sanitizedOutput = input
            .split("")
            .map((char) => (allowedChars.test(char) ? char : ""))
            .join("");
        return sanitizedOutput;
    }

    async function callRefugo() {
        const res = await fetch(motivoUrl);
        dados = await res.json();
        console.log(dados);
    }
    let resRefugo = callRefugo();
    let resultado = getOdfData();
</script>

{#await resultado}
    <div>...</div>
{:then itens}
    <main class="main">
        {#if dadosOdf.length !== 0}
            <div class="fullForm">
                <form action="/api/v1/apontar" method="POST" class="form">
                    <div id="prod" class="write">
                        <p>PRODUZIR</p>
                        <div>
                            {dadosOdf[0].QTDE_ODF[0]}
                        </div>
                    </div>
                    <div class="write" id="feed">
                        <p>BOAS</p>
                        <input
                            on:input={blockForbiddenChars}
                            class="input"
                            id="feed"
                            name="feed"
                        />
                    </div>
                    <div class="write" id="ruins" name="ruins">
                        <p>RUINS</p>
                        <input
                            on:input={blockForbiddenChars}
                            class="input"
                            id="badFeed"
                            name="badFeed"
                        />
                    </div>
                    <div class="write" id="retrabalhar">
                        <p>RETRABALHAR</p>
                        <input
                            on:input={blockForbiddenChars}
                            class="input"
                            id="reworkFeed"
                            type="text"
                            name="reworkFeed"
                        />
                    </div>
                    <div class="write" id="parcialDiv">
                        <p>PARCIAL</p>
                        <input
                            on:input={blockForbiddenChars}
                            class="input"
                            id="parcialfeed"
                            type="text"
                            name="parcial"
                        />
                    </div>
                    <div class="write" id="faltante">
                        <p>FALTANTE</p>
                        <input
                            on:input={blockForbiddenChars}
                            class="input"
                            id="missingFeed"
                            type="text"
                            name="missingFeed"
                        />
                    </div>
                </form>

                <a id="apontar" on:click={doPost} type="submit">
                    <span />
                    <span />
                    <span />
                    <span />
                    APONTAR
                </a>
            </div>

            <!-- {#if showConfirm === true}
                <h3>Confirma?</h3>
            {/if} -->

            <!-- {#await resRefugo}
                <div>...</div>
            {:then item}
                <div class="fundo">
                    <div class="header">
                        <p>MOTIVO DO REFUGO</p>
                        <div class="c">
                            <div class="dd">
                                <div class="dd-p"><span>Opções</span></div>
                                <input type="checkbox" />
                                <div class="dd-c">
                                    {#each dados as item}
                                        <ul>
                                            <li>
                                                <span href="#">{item}</span>
                                            </li>
                                        </ul>
                                    {/each}
                                    <p>Confirmar</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/await} -->
        {/if}
    </main>
{/await}

<style>
    /* .dd-p {
        padding: 10px;
        background: black;
        position: relative;
        -webkit-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
        box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
        transition-duration: 0.2s;
        -webkit-transition-duration: 0.2s;
    }
    .dd input:after {
        content: "";
        width: 100%;
        height: 2px;
        position: absolute;
        display: block;
        background: #c63d0f;
        bottom: 0;
        left: 0;
        transform: scaleX(0);
        transform-origin: bottom left;
        transition-duration: 0.2s;
        -webkit-transform: scaleX(0);
        -webkit-transform-origin: bottom left;
        -webkit-transition-duration: 0.2s;
    }
    .dd input {
        top: 0;
        opacity: 0;
        display: block;
        padding: 0;
        margin: 0;
        border: 0;
        position: absolute;
        height: 100%;
        width: 100%;
    }
    .dd input:hover {
        cursor: pointer;
    }
    /* .dd input:hover ~ .dd-p {
        -webkit-box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.75);
        box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.75);
    } */
    /* .dd input:checked:after {
        transform: scaleX(1);
        -webkit-transform: scaleX(1);
    }
    .dd input:checked ~ .dd-c {
        transform: scaleY(1);
        -webkit-transform: scaleY(1);
    }  */
    /* .dd-p span {
        color: #c63d0f;
    } */
    /* .dd-c {
        display: block;
        position: absolute;
        background: black;
        height: auto;
        transform: scaleY(0);
        transform-origin: top left;
        transition-duration: 0.2s;
        -webkit-transform: scaleY(0);
        -webkit-transform-origin: top left;
        -webkit-transition-duration: 0.2s;
    }
    .dd-c ul {
        margin: 0;
        padding: 0;
        list-style-type: none;
    }
    .dd-c li {
        margin-bottom: 5px;
        word-break: keep-all;
        white-space: nowrap;
        display: block;
        position: relative;
    }


    p {
        display: block;
        position: relative;
        text-decoration: none;
        padding: 5px;
        background: white;
        color: black;
    } */

    a {
        position: relative;
        display: inline-block;
        padding: 10px 20px;
        color: #fff;
        font-size: 16px;
        text-decoration: none;
        text-transform: uppercase;
        overflow: hidden;
        transition: 0.5s;
        margin-top: 40px;
        letter-spacing: 4px;
        border-radius: 5px;
        background-color: black;
    }
    a:hover {
        background: black;
        color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 2.5px black, 0 0 12.5px black, 0 0 25px black,
            0 0 1px black;
    }
    a span {
        position: absolute;
        display: block;
    }
    a span:nth-child(1) {
        top: 0;
        left: -100%;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, transparent, #038c6b);
        animation: btn-anim1 2s linear infinite;
    }
    @keyframes btn-anim1 {
        0% {
            left: -100%;
        }
        50%,
        100% {
            left: 100%;
        }
    }
    a span:nth-child(2) {
        top: -100%;
        right: 0;
        width: 3px;
        height: 100%;
        background: linear-gradient(180deg, transparent, #038c6b);
        animation: btn-anim2 2s linear infinite;
        animation-delay: 0.25s;
    }
    @keyframes btn-anim2 {
        0% {
            top: -100%;
        }
        50%,
        100% {
            top: 100%;
        }
    }
    a span:nth-child(3) {
        bottom: 0;
        right: -100%;
        width: 100%;
        height: 3px;
        background: linear-gradient(270deg, transparent, #038c6b);
        animation: btn-anim3 2s linear infinite;
        animation-delay: 0.5s;
    }
    @keyframes btn-anim3 {
        0% {
            right: -100%;
        }
        50%,
        100% {
            right: 100%;
        }
    }
    a span:nth-child(4) {
        bottom: -100%;
        left: 0;
        width: 3px;
        height: 100%;
        background: linear-gradient(360deg, transparent, #038c6b);
        animation: btn-anim4 2s linear infinite;
        animation-delay: 0.75s;
    }
    @keyframes btn-anim4 {
        0% {
            bottom: -100%;
        }
        50%,
        100% {
            bottom: 100%;
        }
    }

    .main {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin-left: 10%;
    }
    .write {
        margin: 0%;
        /* padding: 0px 30px; */
        font-size: 44px;
    }
    #prod,
    #feed {
        padding: 0px 60px 0px 0px;
    }

    input {
        border-color: grey;
        border-radius: 3px;
        width: 100%;
    }
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
    #parcialDiv {
        display: none;
    }
    main {
        justify-content: center;
        display: flex;
        font-weight: bold;
        letter-spacing: 1px;
    }
    p {
        margin: 1%;
        padding: 0%;
    }

    input {
        width: 130px;
        height: 50px;
        margin: 0%;
        padding: 0%;
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
    div {
        margin-left: 8%;
        padding: 0%;
    }
    /* 
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
    } */
</style>
