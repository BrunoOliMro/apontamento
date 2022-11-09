<script>
    import Cod from "./cod.svelte";
    import Feed from "./feed.svelte";
    import Status from "./status.svelte";
</script>

<!-- <main class="content"> -->
    <!-- <div class="areaImagem">
        <div><Status /></div>
        <div><Cod /></div>
    </div> -->
    <!-- <div> -->
        <!-- <Feed/> -->
    <!-- </div> -->
<!-- </main> -->

<style>
    main {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        letter-spacing: 1px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        border-radius: 5px;
    }
    /* .areaImagem {
        margin-right: 1%;
        padding: 0%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
    .content {
        margin: 0%;
        padding: 0%;
    } */

    /* @media screen and (max-width: 500px) {
        main {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
        .areaImagem {
            margin: 0px;
            padding: 0px;
            box-sizing: border-box;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }
    @media screen and (min-width: 501px) {
        main {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
        .areaImagem {
            margin: 0px;
            padding: 0px;
            box-sizing: border-box;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }
    @media screen and (min-width: 860px) {
        .content {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            margin: 0px;
            padding: 0px;
        }
    }

    @media screen and (min-width: 1000px) {
        .content {
            display: flex;
            flex-direction: row;
            margin: 0%;
            padding: 0%;
        }
    }
    @media screen and (min-width: 1200px) {
        .content {
            display: flex;
            flex-direction: row;
        }
    }

    @media screen and (min-width: 1600px) {
        .content {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            margin: 0px;
            padding: 0px;
        }
    } */
</style>
