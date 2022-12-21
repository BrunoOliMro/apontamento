<script>
   import Title from "../components/title/title.svelte";
   import Feed from "../components/content/feed.svelte";
   let redirectRoute = "/api/v1/clearAll";
   let back = "/images/icons8-go-back-24.png";
   async function redirect() {
      const res = await fetch(redirectRoute).then((res) => res.json());
      console.log("res /feed/", res);
      if (res.message === "Success") {
         window.location.href = "/#/codigobarras/";
      }
   }
</script>

<main>
   <!-- svelte-ignore a11y-positive-tabindex -->
   <a tabindex="8" href="/#/codigobarras/" on:keypress={redirect} on:click={redirect}>
      <img src={back} alt="" /> Código de barras
   </a>
   <Title />
   <Feed />
</main>

<style>
   a {
      margin: 0%;
      padding: 0%;
      color: #252525;
      font-size: 20px;
   }
   a:hover {
      transition: all 1s;
      opacity: 0.8;
   }
   main {
      margin-left: 1%;
      margin-right: 1%;
      margin-top: 5px;
      margin-bottom: 1%;
      padding: 0%;
   }
</style>
