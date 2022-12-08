<script>
    //@ts-nocheck
    import { slide } from 'svelte/transition'
	import { notiPrompt, notificationPrompt, connectedAddress, connectedUsername } from '$lib/state/state';
    import { theme } from '$lib/state/Theme.svelte'

    function noti() {
        let user = JSON.stringify({address: $connectedAddress, name: $connectedUsername})
        const lossUrl = 'http://170.187.182.220:5001/gameplayed'
        const submitLoserData = async (url) => { // sending address to express and postgres
                const res = await fetch(url, {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: user,
                })
                if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                return res
            } 
        submitLoserData(lossUrl)
                .then(res => console.log(res))
                .catch(err => console.error(err))

    }

    
</script>
<div class='relative'>
    {#if $theme == 'dark'}
        <button on:click={notificationPrompt} class='hover:scale-110 transition transition-200'><img class='mt-2' src='/img/notify_dark.svg' alt=''></button>
    {:else}
        <button on:click={notificationPrompt} class='hover:scale-110 transition transition-200'><img class='mt-2' src='/img/notify.svg' alt=''></button>
    {/if}

    {#if $notiPrompt}
        <div class='absolute border rounded-lg px-2 py-2 border-blue-500 
        dark:bg-[#16161d] bg-[#f2f0eb] mt-4 left-1/2 -translate-x-1/2 min-w-max' transition:slide>
        {#if $theme == 'dark'}
            <div class='flex '>
                <img src='/img/info_dark.svg' alt='norefferer' class='w-6 h-6 mr-2 text-gray-600 opacity-70'>Coming soon...
            </div>
        {:else}
            <div class='flex flex-wrap flex-row'>
                <img src='/img/info.svg' alt='norefferer' class='w-6 h-6 mr-2 text-gray-600 opacity-70'>Coming soon...
            </div>
        {/if}
        </div>
    {/if}
</div>