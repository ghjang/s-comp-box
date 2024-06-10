<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let label = "";
  export let value;
  export let activatedValue = null;

  const id = crypto.randomUUID();

  function handleRadioButtonClick() {
    dispatch("toggleItemChanged", {
      label,
      value: activatedValue === value ? null : value,
    });
  }
</script>

<label>
  <input
    {id}
    type="radio"
    {value}
    checked={value === activatedValue}
    on:click={handleRadioButtonClick}
  />
  {label}
</label>

<style>
  label {
    user-select: none;
  }
</style>
