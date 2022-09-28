<script>
</script>

<main class="logobar">
    <img src="/images/LogoCIM.png" alt="" />
</main>

<style>
    main {
        width: 100%;
        height: 40px;
        background-color: #111;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    img {
        width: 110px;
        height: 60px;
    }

    @media print{
        .logobar{
            display: none;
        }
    }

    @media screen and (max-width: 500px) {
        img {
            width: 50px;
            height: 25px;
        }
        main {
            width: 100%;
            height: 20px;
            background-color: #111;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }
    @media screen and (min-width: 501px) {
        img {
            width: 65px;
            height: 30px;
        }
        main {
            width: 100%;
            height: 25px;
            background-color: #111;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }
    @media screen and (min-width: 820px) {
        img {
            width: 65px;
            height: 30px;
        }
        main {
            width: 100%;
            height: 25px;
            background-color: #111;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }

    @media screen and (min-width: 1000px) {
        img {
            width: 80px;
            height: 35px;
        }
        main {
            width: 100%;
            height: 30px;
            background-color: #111;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }
    @media screen and (min-width: 1200px) {
        img {
            width: 90px;
            height: 40px;
        }
        main {
            width: 100%;
            height: 35px;
            background-color: #111;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }

    @media screen and (min-width: 1600px) {
        img {
            width: 100px;
            height: 45px;
        }
        main {
            width: 100%;
            height: 40px;
            background-color: #111;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }
</style>
