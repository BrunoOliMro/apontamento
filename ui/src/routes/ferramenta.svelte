<script>
  import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
  export let Subtitle = "Selecione as Ferramentas necessarias: ";
  // const dataFromBarcode = localStorage.getItem("barcodeData");
  // let APT_TEMPO_OPERACAO = "";
  let fetchItem = [];
  let urlString = `/api/v1/ferramenta?fetchItem=${fetchItem}`;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  async function getfetchItem() {
    const res = await fetch(urlString);
    fetchItem = await res.json();
    console.log(fetchItem);
    return fetchItem;
  }
  let resultado = getfetchItem();

  resultado.then(() => {
    const atributeSrcImg = fetchItem[0].img;
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
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <a class="btnA" href="/#/codigobarras/apontamento">Apontamento</a>
      </li>
    </ol>
  </nav>
  <div class="subtitle">{Subtitle}</div>
  <div class="content">

    {#each fetchItem as row }
      {row}
    {/each}

    {#if fetchItem.length > 0}
      <h3>Selecione as Ferramentas para a produção</h3>
    {/if}

    {#if fetchItem.length === 1}
      <h3>Ferramentas selecionadas inicie agora a produção</h3>
    {/if}

    {#if fetchItem.length === 0}
      <h3>Não há Ferramentas para exibir </h3>
    {/if}
  </div>
</div>

<style>
  .btnA {
    color: black;
  }
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
  .subtitle {
    font-size: 20px;
  }

  @media (max-width: 820px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }

  @media (max-width: 1200px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }

  @media screen and (max-width: 550px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }

  @media screen and (min-width: 551px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }

  @media screen and (min-width: 860px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }
  @media screen and (min-width: 1000px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }
  @media screen and (min-width: 1200px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
  }
  @media screen and (min-width: 1400px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
    .subtitle {
      font-size: 20px;
    }
  }

  @media screen and (min-width: 1600px) {
    div {
      margin: 1%;
      border-radius: 5px;
    }
    .subtitle {
      font-size: 20px;
    }
  }
</style>
