<script>
    //@ts-nocheck
    import { connectedAddress, connectedUsername, userID } from '$lib/state/state'
    import { urlRooms, urlEndedRooms, chessWs } from '$lib/state/state';
    import Auth from '$lib/components/auth/Auth.svelte'
    
    import { io } from 'socket.io-client'
	import { onMount } from 'svelte';
    const socket = io(chessWs);

    let message 
    let getMsgs = []
    $: getMsgs


    async function fetchMessages() {
        let room
        const res = await fetch(urlRooms)
        if (!res.ok) throw new Error(res)
        let rooms = JSON.parse(await res.json())

        if (rooms?.find(room => room.players.includes($userID))) {
            room = rooms.find(room => room.players.includes($userID))
            
            if (room.chat.length) {
                console.log(getMsgs)
                getMsgs = room.chat
            }
        }    
    } setTimeout(fetchMessages, 1500)


    async function fetchEndedMessages() {
        let room
        const res = await fetch(urlEndedRooms)
        if (!res.ok) throw new Error(res)

        let rooms = JSON.parse(await res.json())

        if (rooms?.find(room => room.players.includes($userID))) {
            room = rooms?.find(room => room.players.includes($userID))
            if (room.chat != []) {
                getMsgs = room.chat
            }
        }  
    } setTimeout(fetchMessages, 1500)


    async function sendMsg(msg) {
        let _msg
        if (msg != '/forfeit') {
            _msg = {user: $userID, msg: msg}
        } else {
            _msg = {user: $userID, msg: msg, command: true, request: $userID}
        }
        await socket.emit('sendMessage', _msg)

        msg = undefined
        message = undefined
    }

    socket.on('recieveMessage', (chat) => {
        getMsgs = chat
    })
</script>

<div class='max-w-[26.5rem]'>
    <div class="border dark:border-blue-500 border-indigo-500 w-[22rem] relative rounded-lg h-[33.5rem] dark:bg-[#17171d] ">
        <div class='p-2     absolute top-0 overflow-y-auto w-full max-h-full'>
        {#if getMsgs.length}   
            {#each getMsgs as chatlog}
                <div class={chatlog.user == 'SYSTEM' ? 'text-gray-400 italic' : ''}>
                    {chatlog.user}: {chatlog.msg}
                </div>
            {/each}
        {/if}
        </div>
    </div>
    <div class='bottom-0 w-full mt-10'>

        <label for="chat" class="sr-only">Your message</label>
        <div class="flex items-center py-2 px-3 bg-gray-50 rounded-lg dark:bg-[#2C2C3A] ">
            <textarea bind:value={message} id="chat" class="resize-none min-w-[36] mx-4 p-2.5 text-sm text-gray-900 bg-white rounded-lg border  
            w-full bg-[#3D3D51] dark:text-white 
            dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Your message..."></textarea>
            {#if message}
                <button on:click={(e)=>sendMsg(message)} class="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                    <svg class="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
            {:else}
                <button class="inline-flex justify-center p-2 text-blue-600 rounded-full  opacity-50 dark:text-blue-600" disabled>
                    <svg class="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
            {/if}
        </div>
    </div>
</div>
