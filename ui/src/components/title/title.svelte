<script>
	import QuantityAvai from "src/routes/quantityAvai.svelte";
import HistoricButton from "../buttons/historicButton.svelte";
	import StopButton from "../buttons/stopButton.svelte";
	let apiMotivoParada = "api/v1/motivoParada";
	export let title = "APONTAMENTO";
	let postParada = `api/v1/postParada`
	let stopModal = false;
	let showMaqPar = false;
	let value;
	let dados = []
	callMotivo()

	function showStop() {
		if (stopModal === false) {
			stopModal = true;
		} else {
			stopModal = false;
		}
	}

	function closePop() {
        showMaqPar = false;
        if (stopModal === false) {
            stopModal = true;
        } else {
            stopModal = false;
        }
    }

	const confirm = async () => {
        const headers = new Headers();
        const res = await fetch(postParada, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                value: value,
            }),
        }).then((res) => res.json());
        if (res.message === "maquina parada com sucesso") {
            showMaqPar = true;
            //showmodal = false;
        }
    };

	async function callMotivo() {
        const res = await fetch(apiMotivoParada);
        dados = await res.json();
    }
</script>

<main>
	<div class="fullTitle">
		<div class="titleDiv">
			<h1 class="title">{title}</h1>
		</div>
		<div class="buttonNav">
			<div class="btn">
				<HistoricButton />
			</div>
			<div class="btn">
				<StopButton on:message={showStop} />
			</div>
            <div>
                <QuantityAvai/>
            </div>
		</div>
	</div>

	{#if stopModal === true}
            <div class="modalBackground">
                <div class="itensInsideModal">
                    <div class="closePopDiv">
                        <button
                            class="btnPop"
                            on:keypress={closePop}
                            on:click={closePop}>FECHAR</button
                        >
                    </div>

                    <div class="modalContent">
                        <h2 class="modalTitle">Motivo da Parada</h2>
                        <div class="optionsBar">
                            <select autofocus tabindex="10" bind:value>
                                {#each dados as item}
                                    <option class="optionsBar">{item}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="confirmPopDiv">
                            <button
                                class="btnPopConfirm"
                                id="confirmPop"
                                tabindex="11"
                                on:keypress={confirm}
                                on:click={confirm}
                            >
                                CONFIRMAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
</main>

<style>
	button:hover{
		transition:all 1s;
		opacity: 0.5;
	}
	/* button {
        display: flex;
        justify-content: right;
        text-align: right;
        align-items: right;
        border: none;
        background-color: transparent;
        color: white;
    } */
	.btnPop {
        margin: 0%;
        padding: 0%;
        background-color: transparent;
        flex-direction: row;
		justify-content: right;
		align-items: right;
		text-align: right;
        border-radius: 5px;
        /* opacity: 0.5; */
        color: white;
        border: none;
    }
	.modalBackground {
        transition: 1s;
        position: fixed;
        top: 0;
        left: 0;
        background-color: rgba(17, 17, 17, 0.618);
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        z-index: 999999999999999999999999999999;
    }
    .itensInsideModal {
        transition: all 1s;
        animation: ease-in;
        margin: 0%;
        padding: 0%;
        color: white;
        background-color: #252525;
        top: 0;
        left: 0;
        width: 625px;
        height: 300px;
        display: block;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px;
    }
	.btnPopConfirm {
        margin: 0%;
        padding: 0%;
        background-color: transparent;
        flex-direction: row;
        align-items: left;
        text-align: left;
        justify-content: left;
        border-radius: 5px;
        opacity: 0.5;
        color: white;
        border: none;
    }

    .btnPopConfirm:hover {
        transition: all 1s;
        opacity: 0.8;
    }

    .btnPop:hover {
        transition: all 1s;
        opacity: 0.8;
    }
	.closePopDiv {
        font-size: 12px;
        flex-direction: row;
		justify-content: right;
		align-items: right;
		text-align: right;
        margin-right: 2%;
        margin-top: 1%;
        padding: 0%;
    }
	select {
        width: 350px;
        height: 25px;
        background-color: #252525;
        border-radius: 6px;
        color: #fff;
    }
	option {
        font-size: 18px;
        background-color: #252525;
    }
    .confirmPopDiv {
        font-size: 16px;
        margin: 0%;
        padding: 0%;
        flex-direction: row;
        justify-content: left;
        align-items: left;
        text-align: left;
    }
	.optionsBar {
        margin-bottom: 10px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
    }
    .modalTitle {
        margin-left: 0px;
        margin-bottom: 25px;
        margin-right: 0px;
        margin-top: 0px;
        padding: 0%;
        justify-content: left;
        align-items: left;
        text-align: left;
    }
	.modalContent {
        margin-left: 25px;
        margin-top: 0%;
        margin-bottom: 0%;
        margin-right: 0%;
    }
	.btn{
		margin-left: 25px;
		border: grey;
		padding: 0%;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
	.buttonNav {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
	.fullTitle {
		display: flex;
		flex-direction: row;
		justify-content: left;
		align-items: center;
		text-align: center;
		margin-bottom: 1%;
		margin-left: 1%;
		padding: 0%;
	}
	.title {
		display: flex;
		justify-content: left;
		align-items: left;
		text-align: left;
	}

	main {
		margin-top: 5px;
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
