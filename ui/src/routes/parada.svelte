<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    import Title from "../components/title/title.svelte";
  </script>
  
  <main>
    <Breadcrumb/>
    <Title/>
    <div>
    <div id="cardb" class="card">
      Parada de máquina
      </div>
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