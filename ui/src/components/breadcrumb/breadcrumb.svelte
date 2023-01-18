<script>
  export let titleBreadcrumb = ``;
  export let imgResource = ``;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  async function callDispatch(event) {
    dispatch("message", {
      eventType: event,
      text: "BreadCrumb!",
    });
  }
</script>

<nav class="breadcrumb" aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item">
      <p on:click={callDispatch} on:keypress={callDispatch}>
        <img src={imgResource} alt="" />
        {titleBreadcrumb}
      </p>
    </li>
  </ol>
</nav>

<style>
  nav {
    letter-spacing: 1px;
    margin: 0%;
    padding: 0%;
  }
  p {
    text-decoration: underline;
    font-size: 18px;
    color: black;
    margin: 0%;
    padding: 0%;
  }

  p:hover {
    opacity: 0.7;
    cursor: pointer;
    color: rgb(52, 52, 52);
  }
  

  /* @media screen and (max-width: 500px) {
    .breadcrumb {
      margin-bottom: 1%;
      margin-left: 1%;
      font-size: 13px;
    }
  }
  @media screen and (min-width: 501px) {
    .breadcrumb {
      margin-bottom: 1%;
      margin-left: 1%;
      font-size: 15px;
    }
  }
  @media screen and (min-width: 820px) {
    .breadcrumb {
      margin-bottom: 1%;
      margin-left: 1%;
      font-size: 16px;
    }
  }

  @media screen and (min-width: 1000px) {
    .breadcrumb {
      margin-bottom: 1%;
      margin-left: 1%;
      font-size: 18px;
    }
  }
  @media screen and (min-width: 1200px) {
    .breadcrumb {
      margin-bottom: 1%;
      margin-left: 1%;
      font-size: 20px;
    }
  }

  @media screen and (min-width: 1600px) {
    .breadcrumb {
      margin-bottom: 1%;
      margin-left: 1%;
      font-size: 21px;
    }
  } */
</style>
