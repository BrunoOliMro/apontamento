<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    export let Subtitle = "Selecione as Ferramentas necessarias: ";
    const dataFromBarcode = localStorage.getItem("barcodeData");
    let APT_TEMPO_OPERACAO = "";
    let fetchItem = [];
    let urlString = `/api/v1/ferramenta?fetchItem=${fetchItem}`;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    async function getfetchItem() {
        const res = await fetch(urlString);
        fetchItem = await res.json();
        return fetchItem;
    }
    let resultado = getfetchItem();

    resultado.then(() => {
        const atributeSrcImg = fetchItem[0].img
        // let imgFromBack = [`/images/04350563.jpg` , `/images/04350243-1.jpg`];
        fetchItem.forEach((element) => {
            let divSelector = document.querySelector("div");
            let imgElement = document.createElement("img");
            divSelector.appendChild(imgElement);
            imgElement.setAttribute("src", atributeSrcImg);
            imgElement.setAttribute("alt", "ferramenta");
            imgElement.style.width = "170px";
            imgElement.style.height = "170px";
            imgElement.style.margin = "2%";
            imgElement.style.borderRadius = "3px";
        });
    });
</script>

<div>
    <Breadcrumb />
    {Subtitle}
    <div class="content">
        <!-- <div id="popUP">
            <p>X</p>
            <p>Selecione as Ferramentas para a produção</p>
        </div>

        <div id="popUP">
            <p>X</p>
            <p>Ferramentas selecionadas inicie agora a produção</p>
        </div> -->
    </div>
</div>

<style>
    .content {
        margin-left: 5%;
        margin-right: 5%;
        justify-content: center;
        align-items: center;
        text-align: center;
        display: flex;
        flex-direction: row;
    }

    div {
        margin: 1%;
        border-radius: 5px;
    }
</style>
