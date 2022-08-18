<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte";
    export let Subtitle = "DESENHO"
</script>

<main>
    <Breadcrumb />
    <div class="subtitle">{Subtitle}</div>
    <div class="card"  style="height: 40rem;"></div>
</main>

<style>
    main{
        margin: 1%;
    }
    .card{
        background-color: black;
        margin-left: 5%;
        margin-right: 5%;
    }
    .subtitle{
        font-size: 30px;
        display: flex;
        justify-content: center;
    }
</style>
