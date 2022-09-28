<script>
    // @ts-nocheck

    const dataFromBarcode = localStorage.getItem("barcodeData");
    let NUMERO_ODF = Number(dataFromBarcode.slice(10));
    let NUMERO_OPERACAO = Number(dataFromBarcode.slice(0, 5));
    let CODIGO_MAQUINA = String(dataFromBarcode.slice(5, 10));
    let urlString = `/api/v1/odf?NUMERO_ODF=${NUMERO_ODF}&CODIGO_MAQUINA=${CODIGO_MAQUINA}&NUMERO_OPERACAO=${NUMERO_OPERACAO}`;
    let dadosOdf = [];

    let employeName = document.cookie
        .split(";")
        .map((cookie) => cookie.split("="))
        .reduce(
            (accumulator, [key, value]) => ({
                ...accumulator,
                [key.trim()]: decodeURIComponent(value),
            }),
            {}
        );

    async function getOdfData() {
        const res = await fetch(urlString);
        dadosOdf = await res.json();
        console.log(dadosOdf);
    }
    let resultado = getOdfData();
</script>

<main>
    {#if dadosOdf.length !== 0}
        <div class="areaCodigos">
            <div class="odf">ODF:</div>
            <div class="bold">
                {NUMERO_ODF === null || !NUMERO_ODF ? "S/I" : NUMERO_ODF}
            </div>
            <div class="odf">Cód. Interno:</div>
            <div class="bold">
                {dadosOdf[0].CODIGO_PECA === null || !dadosOdf[0].CODIGO_PECA
                    ? "S/I"
                    : dadosOdf[0].CODIGO_PECA}
            </div>
            <div class="odf">Cód. do Cliente:</div>
            <div class="bold">
                {dadosOdf[0].CODIGO_CLIENTE === null ||
                !dadosOdf[0].CODIGO_CLIENTE
                    ? "S/I"
                    : dadosOdf[0].CODIGO_CLIENTE}
            </div>
            <div class="odf">Operador:</div>
            <div class="bold">
                {employeName.FUNCIONARIO === null || !employeName.FUNCIONARIO
                    ? "S/I"
                    : employeName.FUNCIONARIO}
            </div>
            <div class="odf">OP:</div>
            <div class="bold">
                {NUMERO_OPERACAO === null || !NUMERO_OPERACAO
                    ? "S/I"
                    : NUMERO_OPERACAO} -
                {CODIGO_MAQUINA === null || !CODIGO_MAQUINA
                    ? "S/I"
                    : CODIGO_MAQUINA} -
                {dadosOdf[0].QTDE_ODF[0] === null || !dadosOdf[0].QTDE_ODF[0]
                    ? "S/I"
                    : dadosOdf[0].QTDE_ODF[0]}
            </div>
        </div>
    {:else}
        <h3>Não há histórico para exibir</h3>
    {/if}
</main>

<style>
    .bold {
        font-weight: bold;
    }

    @media screen and (max-width: 550px) {
        .odf {
            font-size: 12px;
        }
        .bold {
            font-size: 15px;
        }
        .areaCodigos {
            padding: 0%;
            margin-right: 0px;
            margin-left: 5px;
            margin-bottom: 2%;
            margin-top: 10px;
            justify-content: flex-start;
            align-items: left;
            text-align: left;
        }
    }

    @media screen and (min-width: 551px) {
        .odf {
            font-size: 20px;
        }
        .bold {
            font-size: 22px;
        }
        .areaCodigos {
            width: 250px;
            padding: 0%;
            margin-right: 0px;
            margin-left: 20px;
            margin-bottom: 2%;
            margin-top: 10px;
            justify-content: flex-start;
            align-items: left;
            text-align: left;
        }
    }

    @media screen and (min-width: 820px) {
        .odf {
            font-size: 14px;
        }
        .bold {
            font-size: 16px;
        }
        .areaCodigos {
            width: 150px;
            padding: 0%;
            margin-right: 0px;
            margin-left: 20px;
            margin-bottom: 2%;
            margin-top: 10px;
            justify-content: flex-start;
            align-items: left;
            text-align: left;
        }
    }
    @media screen and (min-width: 1000px) {
        .odf {
            font-size: 16px;
        }
        .bold {
            font-size: 18px;
        }
        .areaCodigos {
            width: 150px;
            padding: 0%;
            margin-right: 0px;
            margin-left: 20px;
            margin-bottom: 2%;
            margin-top: 10px;
            justify-content: flex-start;
            align-items: left;
            text-align: left;
        }
    }
    @media screen and (min-width: 1200px) {
        .odf {
            font-size: 20px;
        }
        .bold {
            font-size: 20px;
        }
        .areaCodigos {
            width: 300px;
            padding: 0%;
            margin-right: 0px;
            margin-left: 20px;
            margin-bottom: 2%;
            margin-top: 10px;
            justify-content: flex-start;
            align-items: left;
            text-align: left;
        }
    }

    @media screen and (min-width: 1600px) {
        .odf {
            font-size: 25px;
            margin-left: 5px;
        }
        .bold {
            font-size: 25px;
        }
        .areaCodigos {
            padding: 0%;
            margin-right: 0px;
            margin-left: 20px;
            margin-bottom: 2%;
            margin-top: 10px;
            justify-content: flex-start;
            align-items: left;
            text-align: left;
        }
    }
</style>
