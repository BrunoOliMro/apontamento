<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    import Title from "../components/title/title.svelte";
    let HISTORICO = [];

    let urlString = `/api/v1/HISTORICO?&HISTORICO=${HISTORICO}`;
    async function getHISTORICO() {
        const res = await fetch(urlString);
        HISTORICO = await res.json();
        console.log(JSON.stringify(HISTORICO))
        return HISTORICO;
    }

    let res = getHISTORICO()
  </script>
  
  <main>
    <Breadcrumb/>
    <Title/>
    <div>

      {#await res}
        <div>...</div>
    {:then HISTORICO}
    <div id="cardb" class="card">
      {JSON.stringify(HISTORICO)}
      </div>
    {/await}
    </div>
  </main>
  
  
  <style>
    main{
      margin: 1%;
    }
   #cardb{
    width: 600px;
    height: 200px;
   }
  </style>