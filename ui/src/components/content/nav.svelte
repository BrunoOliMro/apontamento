<script>
    const some1 = () => {
        console.log("Faltante");
    };
    const some2 = () => {
        console.log("Retrabalhar");
    };
    const some3 = () => {
        console.log("Inspeção");
    };
    const some4 = () => {
        console.log("Parada");
    };
    const some5 = () => {
        console.log("Historico");
    };
    const some6 = () => {
        console.log("Desenho");
    };
</script>

<main>
    <div class="nav">
        <button on:click={some1} type="button" class="btn btn-primary"
            >Faltante</button
        >
        <button on:click={some2} type="button" class="btn btn-primary"
            >Retrabalhar</button
        >
        <button on:click={some3} type="button" class="btn btn-primary"
            >Inspeção</button
        >
        <button on:click={some4} type="button" class="btn btn-primary"
            >Parada</button
        >
        <button on:click={some5} type="button" class="btn btn-primary"
            >Historico</button
        >
        <a href="/#/desenho/"><button on:click={some6} type="button" class="btn btn-primary"
            >Desenho</button
        ></a>
        
    </div>
</main>

<style>
    .nav {
        margin: 0%;
        padding: 0%;
        width: 100%;
        height: 10%;
        justify-content: space-between;
        align-items: center;
        text-align: center;
    }
</style>
