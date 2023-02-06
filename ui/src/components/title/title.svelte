<script>
    // @ts-nocheck
    import HistoricButton from "../buttons/historicButton.svelte";
    import QuantityAvai from "../components/quantityAvai.svelte";
    import StopButton from "../buttons/stopButton.svelte";
    import messageQuery from "../../utils/checkMessage";
    import { createEventDispatcher } from "svelte";
    const title = "APONTAMENTO";
    let color;
    export let odfData;

    if (odfData.codData.code === messageQuery(16)) {
        color = true;
    }

    const dispatch = createEventDispatcher();

    async function callMiddlewareDispatch(event) {
        if (
            event.key === "Enter" ||
            event.type === "click" ||
            event.detail.text === "Open stop button!"
        ) {
            dispatch("message", {
                eventType: event,
                text: "Open stop btn",
            });
        }
    }
</script>

<div class="nav-area">
    <ul>
        <li class="fist-item-nav">
            <h1>
                {title}
            </h1>
        </li>
    </ul>
    <ul class="quatityAvai">
        <li>
            <StopButton
                bind:machineStop={color}
                on:message={callMiddlewareDispatch}
            />
        </li>
        <li>
            <HistoricButton />
        </li>
        <li>
            <QuantityAvai {odfData} />
        </li>
    </ul>
</div>

<style>
    .fist-item-nav {
        margin: 0%;
        padding: 0%;
    }
    .quatityAvai {
        display: flex;
        flex-direction: row;
        justify-content: right;
        align-items: center;
        text-align: center;
        list-style-type: none;
        margin-top: 10px;
        padding: 0%;
    }
    ul {
        height: fit-content;
        display: flex;
        justify-content: left;
        text-align: center;
        align-items: center;
        margin: 0%;
        padding: 0%;
    }
    li {
        justify-content: center;
        align-items: center;
        text-align: center;
        margin-left: 2%;
        list-style-type: none;
        display: inline;
        float: left;
        padding: 0%;
    }
    .nav-area {
        height: fit-content;
        width: 100%;
        margin-top: 20px;
        margin-left: 0px;
        margin-right: 0px;
        margin-bottom: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0px;
    }
    h1 {
        margin: 0%;
        padding: 0%;
    }
    /* @media screen and (max-width: 500px) {
		#title {
		font-size: 25px;
		margin-top: 1%;
		margin-bottom: 2%;
		margin-left: 2%;
		padding: 0px;
	}
}
	@media screen and (min-width: 501px) {
		#title {
		font-size: 30px;
		margin-bottom: 2%;
		margin-left: 1%;
		padding: 0px;
	}
}
@media screen and (min-width: 820px) {
		#title {
		font-size: 35px;
		margin-bottom: 2%;
		margin-left: 1%;
		padding: 0px;
	}
}

@media screen and (min-width: 1000px) {
		#title {
		
		font-size: 40px;
		margin-bottom: 2%;
		margin-left: 1%;
		padding: 0px;
	}
}
@media screen and (min-width: 1200px) {
		#title {
		font-size: 45px;
		margin-bottom: 2%;
		margin-left: 1%;
		padding: 0px;
	}
}

@media screen and (min-width: 1600px) {
		#title {
		font-size: 50px;
		margin-bottom: 2%;
		margin-left: 1%;
		padding: 0px;
	}
} */
</style>
