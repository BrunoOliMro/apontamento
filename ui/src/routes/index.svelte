<script>
   import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
   import Footer from "../components/content/footer.svelte"
   import Container from "../components/content/container.svelte";
   import Nav from "../components/content/nav.svelte";
   import Title from "../components/title/title.svelte";
</script>

<main>
   <Breadcrumb />
   <Title/>
   <Nav />
   <Container/>
   <Footer/>
</main>

<style>
   main {
      font-size: 20px;
      margin-left: 1%;
      margin-right: 1%;
      margin-top: 1%;
      padding: 0%;
   }
</style>
