<script>
    import { slide } from 'svelte/transition'
	import { notiPrompt, notificationPrompt } from '$lib/state/state';
    import { theme } from '$lib/state/Theme.svelte'

    
</script>
<div class='relative'>
    {#if $theme == 'dark'}
        <button on:click={notificationPrompt} class='hover:scale-110 transition transition-200'><img src='/img/notify_dark.svg' alt=''></button>
    {:else}
        <button on:click={notificationPrompt} class='hover:scale-110 transition transition-200'><img src='/img/notify.svg' alt=''></button>
    {/if}

    {#if $notiPrompt}
        <div class='absolute border rounded-lg px-2 py-2 border-blue-500 
        dark:bg-[#16161d] bg-[#f2f0eb] mt-4 left-1/2 -translate-x-1/2 min-w-max' transition:slide>
        {#if $theme == 'dark'}
            <div class='flex '>
                <img src='/img/info_dark.svg' alt='norefferer' class='w-6 h-6 mr-2'> You leveled up to level 12!
            </div>
        {:else}
            <div class='flex flex-wrap flex-row'>
                <img src='/img/info.svg' alt='norefferer' class='w-6 h-6 mr-2'> You leveled up to level 12!
            </div>
        {/if}
        </div>
    {/if}
</div>