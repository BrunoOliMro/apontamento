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

    let showModal = false;

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
        document.getElementById("popUp1").style.display = "none";
    };
</script>

<main>
    <ul class="nav2">
        <li>Faltante</li>
        <li>Retrabalhar</li>
        <li>Inspeção</li>
        <li>Historico</li>
        <li>Parada</li>
        <li>Desenho</li>
    </ul>
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
        <a href="/#/rip/"
            ><button type="button" class="btn btn-primary">Inspeção</button></a
        >
        <a href="/#/historico/"
            ><button type="button" class="btn btn-primary"> Historico </button>
        </a>
        <button
            type="button"
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#exampleModalCenter"
        >
            Parada
        </button>

        <a href="/#/desenho/"
            ><button type="button" class="btn btn-primary">Desenho</button></a
        >

        <div
            class="modal fade"
            id="exampleModalCenter"
            tabindex="-1"
            role="dialog"
            aria-labelledby="exampleModalCenterTitle"
            aria-hidden="true"
        >
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLongTitle">
                            Motivo da Parada
                        </h5>
                    </div>
                    <div class="modal-body">
                        <li>DOR DE BARRIGA</li>
                        <li>DIARREIA</li>
                        <li>CAGANEIRA</li>
                        <li>SOLTA UM BARRO</li>
                        <li>HEMORROIDA ATACADA</li>
                        <li>FEIJOADA DEMAIS</li>
                    </div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-bs-dismiss="modal">Close</button
                        >
                    </div>
                </div>
            </div>
        </div>
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

    @media screen and (max-width: 500px) {
        .nav2 {
            display: none;
        }
        .nav2 {
            display: none;
        }
    }
    @media screen and (min-width: 501px) {
        .nav2 {
            display: none;
        }
    }
   
    @media screen and (max-width: 820px) {
        .nav {
            display: none;
        }
        .nav2 {
            display: none;
        }
    }
    @media screen and (min-width: 821px) {
        .nav {
            margin-bottom: 2%;
        }
        .nav2 {
            display: none;
        }
    }
</style>
