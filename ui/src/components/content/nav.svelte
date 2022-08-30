<script>
    import badFeed from "../content/feed.svelte";
    import reworkFeed from "../content/feed.svelte";
    import missingFeed from "../content/feed.svelte";
    import some from "../content/feed.svelte";
    import retrabalhar from "../content/feed.svelte";
    import faltante from "../content/feed.svelte";
    import popUp from "../content/feed.svelte";
    import popUp1 from "../content/feed.svelte";
    import popUp2 from "../content/feed.svelte";
    import popUp3 from "../content/feed.svelte";
    import popUp4 from "../content/feed.svelte";
    import popUp5 from "../content/feed.svelte";
    import close from "../content/feed.svelte";

    const getMissingFeed = () => {
        document.getElementById("faltante").style.display = "block";
        document.getElementById("retrabalhar").style.display = "none";
        document.getElementById("some").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
    };
    const getReworkFeed = () => {
        document.getElementById("faltante").style.display = "none";
        document.getElementById("retrabalhar").style.display = "block";
        document.getElementById("some").style.display = "none";
        document.getElementById("badFeed").style.display = "none";
    };

    const paradaMaq = () => {
        document.getElementById("popUp").style.display = "block";
        document.getElementById("popUp1").style.display = "block";
        document.getElementById("popUp2").style.display = "block";
        document.getElementById("popUp3").style.display = "block";
        document.getElementById("popUp4").style.display = "block";
        document.getElementById("popUp5").style.display = "block";
        document.getElementById("close").style.display = "block";
    };
</script>

<main>
    <div class="nav">
        <button
            on:click={getMissingFeed}
            type="button"
            class="btn btn-primary"
            id="missingFeed"
            name="missing"
            >Faltante
        </button>
        <button
            on:click={getReworkFeed}
            type="button"
            class="btn btn-primary"
            id="reworkFeed"
            name="rework"
            >Retrabalhar
        </button>
        <a href="/#/rip/"><button type="button" class="btn btn-primary">Inspeção</button></a
        >
        <a href="/#/historico/"><button type="button" class="btn btn-primary"> Historico </button>
        </a>

        <button on:click={paradaMaq} type="button" class="btn btn-primary">Parada</button>
        <a href="/#/desenho/"
            ><button type="button" class="btn btn-primary">Desenho</button></a
        >
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
