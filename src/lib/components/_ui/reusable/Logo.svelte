<script>
    //@ts-nocheck
    import { theme } from '$lib/state/Theme.svelte'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'

    function refresh() {
        
        if ($page.routeId == '/username' || $page.routeId == '/join' || $page.routeId == '/chess') goto('../')
        else if ($page.routeId?.includes('/profile/')) goto('../../')
        else goto('./')
        
    }
</script>


<button on:click={refresh} class="flex-shrink-0 hover:scale-[1.05] transition transition-200">
    {#if $theme == 'light'}
        <h1 class='text-3xl text-[#8a82bd]'><i>trxmini.games</i></h1>
    {/if}
    {#if $theme == 'dark'}
        <h1 class='text-3xl'><i>trxmini.games</i></h1>
    {/if}
</button>
