<script>
	import Index from "./routes/index.svelte";
	import Router from "svelte-spa-router";
	//import Ferramenta from "src/routes/Ferramenta.svelte";
	import Ferramenta from './routes/ferramenta.svelte'
	import Rip from "./routes/rip.svelte";
	import Desenho from "./routes/desenho.svelte";
	import Barcode from "./routes/barcode.svelte";
	import historico from "./routes/historico.svelte";
	import Logobar from "./components/navigation/logobar.svelte";
</script>

<main>
	<Logobar />
</main>


<Router
	routes={{
		"/codigobarras/apontamento": Index,
		"/desenho": Desenho,
		"/rip": Rip,
		"/ferramenta": Ferramenta,
		"/codigobarras": Barcode,
		"/historico": historico,
	}}
/>
