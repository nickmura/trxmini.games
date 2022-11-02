<script>
    import { theme } from '../../state/Theme.svelte'
    import { goto } from '$app/navigation'
    function refresh() {
        goto('./')
    }
</script>


<button on:click={refresh} class="flex-shrink-0 hover:scale-[1.05] transition transition-200">
    {#if $theme == 'light'}
        <img src="/img/top-logo.png" width='250px' height='65px' alt="Logo" />
    {/if}
    {#if $theme == 'dark'}
        <img src="/img/bottom-logo.png" width='250px' height='65px' alt="Logo" />
    {/if}
</button>
