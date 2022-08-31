<script>
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
    let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);
    let goodFeed;
    let badFeed;
    let missingFeed;
    let reworkFeed;
    import paradaMaq from "../content/nav.svelte"

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let urlString = `/api/v1/apontamento?NUMERO_ODF=${NUMERO_ODF}&CODIGO_MAQUINA=${CODIGO_MAQUINA}&NUMERO_OPERACAO=${NUMERO_OPERACAO}`;
    async function getOdfData() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        return odfData;
    }
    
    const doPost = async () => {
        const headers = new Headers();
        const res = fetch(`/api/v1/apontar`, {
            method: "POST",
            body: JSON.stringify({
                goodFeed: goodFeed,
                badFeed: badFeed,
                reworkFeed: reworkFeed,
                missingFeed: missingFeed,
            }),
            headers,
        });
    };
    
    let resultado = getOdfData();
</script>

<main  class="align-self-center">
    {#await resultado}
        <div>...</div>
    {:then dadosOdf}
        <form action="/api/v1/apontar" method="POST">
            <div class="write">Produzir {dadosOdf[0].QTDE_ODF[0]}</div>
            <div class="write" id="goodFeed">
                Boas
                <input class="input" id="goodFeed" name="goodFeed" />
            </div>
            <div  class="write" id="some" name="some">
                Ruins
                <input class="input" id="badFeed" name="badFeed" />
            </div>
            <div class="write" id="retrabalhar">
                Retrabalhar
                <input class="input" type="text" id="reworkFeed" name="reworkFeed" />
            </div>
            <div class="write" id="faltante">
                Faltante
                <input class="input" type="text" id="missingFeed" name="missingFeed" />
            </div>
            <button id="button" on:click={doPost} type="submit" class="btn btn-primary"
                >Apontar</button
            >
            
        </form>
    {/await}
</main>

<style>
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

    div {
        margin: 2%;
    }

    #retrabalhar {
        display: none;
    }

    #faltante {
        display: none;
    }
    
    @media (max-width: 400px) {
        .write{
            font-size: 15px;
        }
        .input{
            width: 50px;
        }
    }

    /* @media (max-width: 600px) {
        .write{
            font-size: 5px;
        }
        .input{
            width: 40px;
        }
    }


    @media(max-width: 850px){
       
        .write{
            font-size: 10px;
        }
        .input{
            width: 60px;
        }
    }

    @media(max-width: 1000px){
        .write{
            font-size: 20px;
        }

        .input{
            width: 80px;
        }
    }

    @media(max-width: 1200px){
        .input{
            width: 40px;
        }
        .write{
            font-size: 10px;
        }
    }
    

    @media(max-width: 1400px){
        .write{
            font-size: 60px;
        }

        .input{
            width: 125px;
        }
    }

    @media(max-width: 1600px){
        
        .write{
            font-size: 80px;
        }
       
        .input{
            width: 120px;
        }
    } */
</style>
