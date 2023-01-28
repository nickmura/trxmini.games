<script lang='ts'>

    import { slide } from 'svelte/transition'
	import { notiPrompt, notificationPrompt, postRequest, connectedAddress, connectedUsername, playerNotifications } from '$lib/state/state';
    import { theme } from '$lib/state/Theme.svelte'

    interface Notification {
        notification: String,
        id: Number,
    }


    async function deleteNotification(n:Notification) {
        let array:Notification[] = $playerNotifications
        let deleteNotificationUrl = 'http://170.187.182.220:5001/deletenotification'
        let body = JSON.stringify({notification: n.notification, id: n.id})

        const index = array?.findIndex(notification => notification.id == n.id)
        if (index > -1) array.splice(index, 1)

        playerNotifications.set(array)
        postRequest(deleteNotificationUrl, body)
    }

    
</script>
<div class='relative'>
    {#if $theme == 'dark'}
        <button on:click={notificationPrompt} class='hover:scale-110 transition transition-200'><img class='mt-2' src='/img/notify_dark.svg' alt=''></button>
    {:else}
        <button on:click={notificationPrompt} class='hover:scale-110 transition transition-200'><img class='mt-2' src='/img/notify.svg' alt=''></button>
    {/if}

    {#if $notiPrompt}
        {#if $playerNotifications}
        <div class='absolute border rounded-lg px-2 py-2 border-blue-500 
        dark:bg-[#16161d] bg-[#f2f0eb] mt-4 left-1/2 -translate-x-1/2 min-w-max' transition:slide>
        
            {#each $playerNotifications as noti}
                <div class='flex'>
                    {#if $theme == 'dark'}
                        <img src='/img/info_dark.svg' alt='norefferer' class='w-6 h-6 mr-2 text-gray-600 opacity-50'>
                        <div class=''>{@html noti.notification}</div>
                        <button on:click={(e) => deleteNotification(noti)}><img src='/img/close_dark.svg' class='h-4 w-4 ml-6 hover:scale-1.05 hover:opacity-70' alt='noreferrer'></button>
                    {:else}
                        <img src='/img/info.svg' alt='noreferrer' class='w-6 h-6 mr-2 text-gray-600 opacity-50'>
                        <div class=''>{@html noti.notification}</div>
                        <button on:click={(e) => deleteNotification(noti)}><img src='/img/close.svg' class='h-4 w-4 ml-6 hover:scale-1.05 hover:opacity-70' alt='noreferrer'></button>
                    {/if}
                    
                </div>
            {/each}
        </div>
        {/if}
        {#if !$playerNotifications.length}
            <div class='absolute border rounded-lg px-2 py-2 border-blue-500 
            dark:bg-[#16161d] bg-[#f2f0eb] mt-4 left-1/2 -translate-x-1/2 min-w-max' transition:slide>
                <div class='text-gray-500'><i>No new notifications!</i></div>
            </div>
        {/if}
        

        

    {/if}
    
</div>