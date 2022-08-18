<script>
import Cod from "./cod.svelte";
import Feed from "./feed.svelte";
import Status from "./status.svelte";

</script>

<main>
    <div class="areaImagem">
        <Status/>
        <Cod/>
    </div>
    <Feed/>
</main>

<style>
    main{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .areaImagem {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
    }
</style>
