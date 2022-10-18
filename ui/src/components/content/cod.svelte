<script>
    // @ts-nocheck
    let urlString = `/api/v1/odf`;
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
    }
    let resultado = getOdfData();
</script>

{#await resultado}
    <div>...</div>
{:then itens}
    <main>
        <div class="areaCodigos">
            <p class="odf">ODF:</p>
            <p class="bold">
                {dadosOdf.objOdfSelecionada.NUMERO_ODF === null || !dadosOdf.objOdfSelecionada.NUMERO_ODF
                    ? "S/I"
                    : dadosOdf.objOdfSelecionada.NUMERO_ODF}
            </p>
            <p class="odf">Cód. Interno:</p>
            <p class="bold">
                {dadosOdf.objOdfSelecionada.CODIGO_PECA === null || !dadosOdf.objOdfSelecionada.CODIGO_PECA
                    ? "S/I"
                    : dadosOdf.objOdfSelecionada.CODIGO_PECA}
            </p>
            <p class="odf">Cód. do Cliente:</p>
            <p class="bold">
                {dadosOdf.objOdfSelecionada.CODIGO_CLIENTE === null || !dadosOdf.objOdfSelecionada.CODIGO_CLIENTE
                    ? "S/I"
                    : dadosOdf.objOdfSelecionada.CODIGO_CLIENTE}
            </p>
            <p class="odf">Operador:</p>
            <p class="bold">
                {employeName.FUNCIONARIO === null || !employeName.FUNCIONARIO
                    ? "S/I"
                    : employeName.FUNCIONARIO}
            </p>
            <p class="odf">OP:</p>
            <p class="bold">
                {dadosOdf.objOdfSelecionada.NUMERO_OPERACAO === null || !dadosOdf.objOdfSelecionada.NUMERO_OPERACAO
                    ? "S/I"
                    : dadosOdf.objOdfSelecionada.NUMERO_OPERACAO} -
                {dadosOdf.objOdfSelecionada.CODIGO_MAQUINA === null || !dadosOdf.objOdfSelecionada.CODIGO_MAQUINA
                    ? "S/I"
                    : dadosOdf.objOdfSelecionada.CODIGO_MAQUINA} -
                {dadosOdf.objOdfSelecionada.QTDE_ODF === null || !dadosOdf.objOdfSelecionada.QTDE_ODF
                    ? "S/I"
                    : dadosOdf.objOdfSelecionada.QTDE_ODF}
            </p>
        </div>
    </main>
{/await}

<style>
    main {
        letter-spacing: 1px;
    }
    .bold {
        font-weight: bold;
    }
    .areaCodigos {
        margin-left: 5px;
        padding: 0%;
        justify-content: flex-start;
        align-items: left;
        text-align: left;
    }
    div {
        margin: 0%;
        padding: 0%;
    }
    .odf {
        margin: 0%;
        padding: 0%;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        text-align: flex-start;
    }

    p {
        margin: 0%;
        padding: 0%;
        font-size: 18px;
    }

    /* @media screen and (max-width: 550px) {
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
    } */
</style>
