<script lang="ts">
  export let src: string | null
  export let alt: string
  export let photoCount: number = 1
</script>

<div class="relative inline-block" style="width: 40px; height: 40px;" on:click>
  {#if src}
    <img
      {src}
      {alt}
      style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.25rem; cursor: pointer;"
    />
    {#if photoCount > 1}
      <div
        class="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl"
        style="font-size: 10px; line-height: 1.2; padding: 2px 4px;"
      >
        +{photoCount - 1}
      </div>
    {/if}
  {/if}
</div>
