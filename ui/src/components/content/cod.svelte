<script>
    // @ts-nocheck
    import ModalConfirmation from "../modal/modalConfirmation.svelte";
    let imageLoader = "/images/axonLoader.gif";
    let urlString = `/api/v1/odfData`;
    let message = "";
    let odfData;
    let numeroOdf;
    let codigoPeca;
    let codigoCliente;
    let machineCode;
    let qtdeOdf;
    let funcionario;
    let operationNumber;
    let resultOdf = getOdfData();

    async function getOdfData() {
        const res = await fetch(urlString);
        odfData = await res.json();

        console.log("linha 14 /cod.svelte////////////////////", odfData);

        if (odfData.message === "Algo deu errado") {
            message = odfData.message;
        } else {
            numeroOdf = odfData.odfSelecionada.NUMERO_ODF;
            codigoPeca = odfData.odfSelecionada.CODIGO_PECA;
            codigoCliente = odfData.odfSelecionada.CODIGO_CLIENTE;
            machineCode = odfData.odfSelecionada.CODIGO_MAQUINA;
            qtdeOdf = odfData.odfSelecionada.QTDE_ODF;
            funcionario = odfData.resEmployee;
            operationNumber = odfData.odfSelecionada.NUMERO_OPERACAO;
        }

        if (odfData.message === "Acesso negado") {
            message = "Acesso Negado";
            window.location.href = "/#/codigobarras";
            location.reload();
        }

        if (
            odfData.message ===
            "Algo deu errado ao buscar pelo codigo de apontamento"
        ) {
            window.location.href = "/#/codigobarras";
            message = "Acesso Negado";
            location.reload;
        }
    }

    function redirect() {
        message = "";
        window.location.href = "/#/rip";
        location.reload();
    }

    function redirectWithouPermissions() {
        message = "";
        window.location.href = "/#/codigobarras";
        location.reload();
    }
</script>

{#await resultOdf}
    <div class="imageLoader">
        <div class="loader">
            <img src={imageLoader} alt="" />
        </div>
    </div>
{:then itens}
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

{#if message === "codeApont 4 prod finalizado"}
    <ModalConfirmation on:message={redirect} />
{/if}

{#if message === "Acesso negado"}
    <ModalConfirmation on:message={redirectWithouPermissions} />
{/if}

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
