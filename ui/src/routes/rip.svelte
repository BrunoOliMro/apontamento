<script>
    import Breadcrumb from "../components/breadcrumb/breadcrumb.svelte"
    import Table from "../components/content/table.svelte";
    export let Subtitle = "RIP - RELATÓRIO DE INSPEÇÃO DE PROCESSOS";

    
</script>

<main>
        <Breadcrumb />
        <div>{Subtitle}</div>
        <Table/>
</main>

<style>
    main{
        margin: 1%;
    }
    div{
        font-size: 30px;
        display: flex;
        justify-content: center;
    }
</style>
