<script>
    // @ts-nocheck
    let imageLoader = "/images/axonLoader.gif";
    let operationNumber;
    export let odfData;
    let codigoCliente;
    let machineCode;
    let funcionario;
    let codigoPeca;
    let numeroOdf;
    let qtdeOdf;

    if (!odfData.codData.data) {
        odfData.codData.data = "S/I";
    } else {
        numeroOdf = odfData.codData.data.NUMERO_ODF;
        codigoPeca = odfData.codData.data.CODIGO_PECA;
        codigoCliente = odfData.codData.data.CODIGO_CLIENTE;
        machineCode = odfData.codData.data.CODIGO_MAQUINA;
        qtdeOdf = odfData.codData.data.QTDE_ODF;
        funcionario = odfData.codData.data.FUNCIONARIO;
        operationNumber = odfData.codData.data.NUMERO_OPERACAO;
    }
</script>

{#await odfData.codData.data}
    <div class="image-loader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then}
    <main>
        <div class="areaCodigos">
            <div class="odf-area">
                <p class="odf">ODF:</p>
                <p class="bold">
                    {numeroOdf === null || !numeroOdf ? "S/I" : numeroOdf}
                </p>
            </div>

            <hr />

            <div class="odf-area">
                <p class="odf">Cód. Interno:</p>
                <p class="bold">
                    {codigoPeca === null || !codigoPeca ? "S/I" : codigoPeca}
                </p>
            </div>

            <hr />
            <div class="odf-area">
                <p class="odf">Cód. do Cliente:</p>
                <p class="bold">
                    {codigoCliente === null || !codigoCliente
                        ? "S/I"
                        : codigoCliente}
                </p>
            </div>
            <hr />
            <div class="odf-area">
                <p class="odf">OP:</p>
                <p class="bold">
                    {operationNumber === null || !operationNumber
                        ? "S/I"
                        : operationNumber} -
                    {machineCode === null || !machineCode ? "S/I" : machineCode}
                    -
                    {qtdeOdf === null || !qtdeOdf ? "S/I" : qtdeOdf}
                </p>
            </div>
            <hr />
            <div class="odf-area">
                <p class="odf">Operador:</p>
                <p class="bold">
                    {funcionario === null || !funcionario ? "S/I" : funcionario}
                </p>
            </div>
        </div>
    </main>
{/await}

<style>
    .loader {
        margin: 0%;
        position: relative;
        width: 10vw;
        height: 5vw;
        padding: 1.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999999999999;
    }
    .image-loader {
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
        z-index: 99999999999999999;
    }
    main {
        letter-spacing: 1px;
    }
    .bold {
        font-weight: bold;
        font-size: 24px;
    }
    .areaCodigos {
        margin-left: 5px;
        padding: 0%;
        justify-content: left;
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
        font-size: 22px;
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
