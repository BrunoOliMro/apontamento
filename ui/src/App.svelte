<script>
	import Router from "svelte-spa-router";
	import Logobar from "./components/navigation/logobar.svelte";
	import Barcode from "./routes/barcode.svelte";
	import Tools from "./routes/tools.svelte";
	import Point from "./routes/index.svelte";
	import Rip from "./routes/rip.svelte";
	import Drawing from "./routes/drawing.svelte";
	import Historic from "./routes/historic.svelte";
</script>

<main>
	<Logobar />
</main>

<Router
	routes={{
		"/barcode": Barcode,
		"/barcode/tools": Tools,
		"/barcode/tools/point": Point,
		"/barcode/tools/point/rip": Rip,
		"/barcode/tools/point/drawing": Drawing,
		"/barcode/tools/point/historic": Historic,
	}}
/>
