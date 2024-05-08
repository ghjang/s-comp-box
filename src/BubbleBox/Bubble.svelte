<script>
  export let message = "";
  export let sender = "user";
</script>

<div class="bubble {sender}">
  {#if message}
    {message}
  {:else}
    <slot />
  {/if}
</div>

<style>
  .bubble {
    width: fit-content;
    max-width: 80%;
    padding: 10px;
    margin: 5px;
    border-radius: 10px;
    color: white;
  }

  .user {
    align-self: flex-end;
    background-color: #0b93f6;
  }

  .bot {
    align-self: flex-start;
    background-color: #e5e5ea;
    color: black;
  }
</style>
