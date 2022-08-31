<script>
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = dataFromBarcode.slice(0, 5);
    let CODIGO_MAQUINA = dataFromBarcode.slice(5, 10);

    // Procura na string
    // let allCookies = document.cookie;
    // allCookies.split(";");
    // let numberFunc = allCookies.search("FUNCIONARIO=") + 12;
    // let gss = allCookies.search("barcode=") - 2;
    // let someee = allCookies.slice(numberFunc, gss);

    let someth = document.cookie
        .split(";")
        .map((cookie) => cookie.split("="))
        .reduce(
            (accumulator, [key, value]) => ({
                ...accumulator,
                [key.trim()]: decodeURIComponent(value),
            }),
            {}
        );

    console.log(someth);

    let urlString = `/api/v1/apontamento?NUMERO_ODF=${NUMERO_ODF}&CODIGO_MAQUINA=${CODIGO_MAQUINA}&NUMERO_OPERACAO=${NUMERO_OPERACAO}`;
    async function getOdfData() {
        const res = await fetch(urlString);
        const odfData = await res.json();
        console.log(odfData);
        return odfData;
    }
    let resultado = getOdfData();
</script>

<main>
    {#await resultado}
        <div>...</div>
    {:then dadosOdf}
        <div class="areaCodigos">
            <div class="odf">ODF: {NUMERO_ODF}</div>
            <div class="odf">
                Cód. Interno: {dadosOdf[0].CODIGO_PECA}
            </div>
            <div class="odf">Cód. do Cliente: {dadosOdf[0].CODIGO_CLIENTE}</div>
            <div class="odf">Operador: {someth.FUNCIONARIO}</div>
            <div class="bold">
                OP: {NUMERO_OPERACAO} - {CODIGO_MAQUINA} - {dadosOdf[0]
                    .QTDE_ODF[0]}
            </div>
        </div>
    {/await}
</main>

<style>
    .bold {
        font-weight: bold;
    }
    .areaCodigos {
        padding: 0%;
        margin-top: 5%;
        height: 18rem;
        display: flex;
        flex-direction: column;
        align-items: left;
        justify-content: space-between;
    }



    @media (max-width: 400px) {
        .odf{
            font-size: 12px;
        }
        .bold{
            font-size: 12px;
        }
    }

    /* @media (max-width: 600px) {
        .odf{
            font-size: 5px;
        }
        .bold{
            width: 40px;
        }
    }

    @media(max-width: 850px){
       
        .odf{
            font-size: 10px;
        }
        .bold{
            font-size: 10px;
        }
    }

    @media(max-width: 1000px){
        
                
        .odf{
            font-size: 10px;
        }

        .bold{
            font-size: 10px;
        }
    }

    @media(max-width: 1200px){
        .bold{
            font-size: 10px;
        }
        
        .odf{
            font-size: 10px;
        }
    }
    

    @media(max-width: 1400px){
        
        .odf{
            font-size: 10px;
        }

        .bold{
            font-size: 10px;
        }
    }

    @media(max-width: 1600px){
        
        .odf{
            font-size: 10px;
        }
       
        .bold{
            font-size: 10px;
        }
    } */
</style>
