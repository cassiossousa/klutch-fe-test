<script lang="ts">
  export let src: string | null
  export let alt: string
  export let photoCount: number = 1
</script>

<button
  type="button"
  class="relative inline-block bg-none border-none p-0 cursor-pointer"
  style="width: 40px; height: 40px;"
  on:click
  title={photoCount > 0
    ? `View ${photoCount} photo${photoCount > 1 ? 's' : ''}`
    : alt}
>
  {#if src}
    <img
      {src}
      {alt}
      style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.25rem; cursor: pointer;"
      aria-hidden="true"
    />
    {#if photoCount > 1}
      <div
        class="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl"
        style="font-size: 10px; line-height: 1.2; padding: 2px 4px;"
        aria-label={`${photoCount} photos total`}
      >
        +{photoCount - 1}
      </div>
    {/if}
  {:else if photoCount > 0}
    <div
      class="w-full h-full bg-gray-200 rounded flex items-center justify-center"
      style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.25rem; cursor: pointer;"
      aria-label={`${photoCount} photos for ${alt}`}
    >
      <span class="text-gray-500 text-xs font-medium">{photoCount}</span>
    </div>
  {/if}
</button>
