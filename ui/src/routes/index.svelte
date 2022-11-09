<script>
   import Footer from "../components/content/footer.svelte"
   import Container from "../components/content/container.svelte";
   import Nav from "../components/content/nav.svelte";
    import Title from "../components/title/title.svelte";
    import Feed from "../components/content/feed.svelte";
</script>

<main>
   <Title/>
   <!-- <Nav  /> -->
   <Feed/>
   <Container />
   <Footer/>
</main>

<style>
   main {
      margin-left: 1%;
      margin-right: 1%;
      margin-top: 5px;
      margin-bottom: 1%;
      padding: 0%;
   }
</style>
