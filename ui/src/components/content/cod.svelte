<script>
    // @ts-nocheck
    import ModalConfirmation from '../modal/modalConfirmation.svelte'
    let imageLoader = '/images/axonLoader.gif';
    let urlString = `/api/v1/odf`;
    let odfData;
    let message = '';
    let resultOdf = getOdfData();

    async function getOdfData() {
        const res = await fetch(urlString);
        odfData = await res.json();

        if (odfData.message === 'codeApont 5 maquina parada') {
            message = 'codeApont 5 maquina parada';
            window.location.href = '/#/codigobarras';
        }

        if (odfData.message === 'codeApont 4 prod finalizado') {
            message = 'codeApont 4 prod finalizado';
        }

        if (odfData.message === 'usuario diferente') {
            message = 'usuario diferente';

        }

        if (odfData.message === 'codeApont 3 prod ini') {
            message = 'codeApont 3 prod ini';
        }

        if(odfData.message === 'Acesso negado'){
            message = 'Acesso Negado'
            window.location.href = '/#/codigobarras';
            location.reload()
        }

        if(odfData.message === 'Algo deu errado ao buscar pelo codigo de apontamento'){
            window.location.href = '/#/codigobarras';
            message = 'Acesso Negado'
            location.reload
        }

    }

    function redirect() {
        message = '';
        window.location.href = '/#/rip';
        location.reload();
    }

    function redirectWithouPermissions(){
        message = ''
        window.location.href = '/#/codigobarras';
        location.reload()
    }
</script>

{#await resultOdf}
    <div class='imageLoader'>
        <div class='loader'>
            <img src={imageLoader} alt='' />
        </div>
    </div>
{:then itens}
    <main>
        <div class='areaCodigos'>
            <div class='odf-area'>
                <p class='odf'>ODF:</p>
                <p class='bold'>
                    {odfData.odfSelecionada.NUMERO_ODF === null ||
                    !odfData.odfSelecionada.NUMERO_ODF
                        ? 'S/I'
                        : odfData.odfSelecionada.NUMERO_ODF}
                </p>
            </div>

            <hr>

            <div class='odf-area'>
                <p class='odf'>Cód. Interno:</p>
                <p class='bold'>
                    {odfData.odfSelecionada.CODIGO_PECA === null ||
                    !odfData.odfSelecionada.CODIGO_PECA
                        ? 'S/I'
                        : odfData.odfSelecionada.CODIGO_PECA}
                </p>
            </div>

            <hr>
            <div class='odf-area'>
                <p class='odf'>Cód. do Cliente:</p>
                <p class='bold'>
                    {odfData.odfSelecionada.CODIGO_CLIENTE === null ||
                    !odfData.odfSelecionada.CODIGO_CLIENTE
                        ? 'S/I'
                        : odfData.odfSelecionada.CODIGO_CLIENTE}
                </p>
            </div>
            <hr>
            <div class='odf-area'>
                <p class='odf'>OP:</p>
                <p class='bold'>
                    {odfData.odfSelecionada.NUMERO_OPERACAO === null ||
                    !odfData.odfSelecionada.NUMERO_OPERACAO
                        ? 'S/I'
                        : odfData.odfSelecionada.NUMERO_OPERACAO} -
                    {odfData.odfSelecionada.CODIGO_MAQUINA === null ||
                    !odfData.odfSelecionada.CODIGO_MAQUINA
                        ? 'S/I'
                        : odfData.odfSelecionada.CODIGO_MAQUINA} -
                    {odfData.odfSelecionada.QTDE_ODF === null ||
                    !odfData.odfSelecionada.QTDE_ODF
                        ? 'S/I'
                        : odfData.odfSelecionada.QTDE_ODF}
                </p>
            </div>
            <hr>
            <div class='odf-area'>
                <p class='odf'>Operador:</p>
                <p class='bold'>
                    {odfData.funcionario === null || !odfData.funcionario
                        ? 'S/I'
                        : odfData.funcionario}
                </p>
            </div>
        </div>
    </main>
{/await}

{#if message === 'codeApont 4 prod finalizado'}
    <ModalConfirmation on:message={redirect} />
{/if}

{#if message === 'Acesso negado'}
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
