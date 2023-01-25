<script>
    import TableAddress from "../Tables/tableAddress.svelte";

    export let odfData = null;
</script>

{#if odfData && odfData !== ""}
    <h2>Histórico de endereçamento</h2>
    <div class="address-area">
        <table>
            <tr id="header">
                <th scope="col">DATA</th>
                <th scope="col">ODF</th>
                <th scope="col">CODIGO DA PEÇA</th>
                <th scope="col">ENDEREÇO</th>
                <th scope="col">STATUS</th>
                <th scope="col">QUANTIDADE</th>
            </tr>
            {#each odfData.data as address}
                <TableAddress data={address} />
            {/each}
        </table>
    </div>
{/if}

<style>
    h2{
        display: flex;
        flex-direction: row;
        text-align: center;
        justify-content: center;
        align-items: center;
    }
    .address-area {
        width: 98%;
        color: black;
        margin: 1%;
        padding: 0%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        align-items: center;
        height: 100%;
        letter-spacing: 1px;
        border-color: grey;
        box-shadow: 0 0 10px 0.5px rgba(0, 0, 0, 0.4);
        border-radius: 10px;
    }
</style>
