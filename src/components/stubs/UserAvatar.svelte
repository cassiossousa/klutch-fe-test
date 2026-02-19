<script lang="ts">
  export let initials: string
  export let fullName: string | undefined = undefined
  export let avatarUrl: string | null | undefined = undefined
</script>

<div
  class="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 font-medium text-xs"
  title={fullName || initials}
>
  {#if avatarUrl}
    <img src={avatarUrl} alt={fullName || initials} class="w-full h-full rounded-full" />
  {:else}
    {initials}
  {/if}
</div>
