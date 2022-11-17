<script>
    //@ts-nocheck

    import { beforeUpdate, onMount } from 'svelte'
    import { slide } from 'svelte/transition'

    import { browser } from '$app/environment'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'


    import { theme } from '$lib/state/Theme.svelte'
    import { createPrompt, url0, url1 } from '$lib/state/state'
    import { 
        connectedAddress, 
        connectedUsername,
        connectedChain,
        chessContract,
        createGameForm,
        getBalance,
        urlRooms,
        urlEndedRooms,
        inGame
    } from '$lib/state/state'

	import Chess from '../chess/Chess.svelte';
    
    
    let isExpanded = false
    let user
    let rooms
    let currentRoom

    async function check() { 
        try {
            if (browser) {
                const res = await window.tronLink
                console.log(res)
                let ifChain = await res.tronWeb.trx.getContract(chessContract)
                if (ifChain.name) { connectedChain.set(true) }
                //console.log(ifChain.name)
                //console.log($connectedChain)
                if (res.tronWeb == undefined || res.tronWeb === false) { 
                    connectedAddress.set()
                } if (res.tronWeb) {
                    connectedAddress.set(res.tronWeb.defaultAddress.base58)
                    sessionStorage.setItem('connectedAddr', res.tronWeb.defaultAddress.base58)

                }
            }
        } catch (error) {
            console.log(error)
        }
    } check()
    setTimeout(check, 100)
    
    
    async function updateRooms() {
        let room
		const res = await fetch(urlRooms)
		if (!res.ok) return res.text().then(text => { throw new Error(text) })
		else rooms = JSON.parse(await res.json())

        console.log($connectedUsername)
        if ($connectedUsername) { //This is not runing because $connectedUsername isn't before this component via Auth.svelte
            if (rooms != null) room = rooms.find(room => room.players.includes($connectedUsername))
                if (room) { 
                    inGame.set(true)
                    currentRoom = true
                } else {
                    inGame.set(false)
                    currentRoom = false
                }
        }       
        
    } setTimeout(updateRooms, 500)

    async function getEndedRoom() { // Checks if currentRoom has already ended (host or someone left, etc)
       let room
       const res = await fetch(urlEndedRooms)
       if (!res.ok) return res.text().then(text => { throw new Error(text) })
       rooms = JSON.parse(await res.json())

        //@ts-ignore
        if (rooms?.find(room => room.players.includes($connectedUsername))) {
            currentRoom = rooms?.find(room => room.players.includes($connectedUsername))
            if (currentRoom) { 
                    inGame.set(true)
                    currentRoom = true
                } else {
                    inGame.set(false)
                    currentRoom = false
                }
            if (currentRoom.host) host = currentRoom.host
            if (currentRoom.player2) player2 = currentRoom.player2
            currentState.set(currentRoom.fen)
            fullGame = true
            gameEnded = true
            console.log(currentRoom)
            inGame.set(true)
            if (currentRoom.orientation == $connectedUsername) {
                color = 'black'
            } else {
                color = 'white'
            }
            if (currentRoom.isCheckmate) {
                winner = currentRoom.isCheckmate
            }
            if (currentRoom.isStalemate == 'true') {
                Stalemate = true
            }
            if (currentRoom.isDraw == 'true') {
                isDraw = true;
            }
        }
       
    } setTimeout(getEndedRoom, 1000)


    async function checkUser() {
        if (browser) {
            
            const res = await window.tronLink 
            if (res.tronWeb) connectedAddress.set(res.tronWeb.defaultAddress.base58)
            getBalance.set(await window.tronWeb.trx.getBalance($connectedAddress) / 1000000)
            if ($connectedAddress) {
                console.log($connectedAddress)
                const url2 = `http://170.187.182.220:5001/username?addr=${$connectedAddress}`
                const res = await fetch(url2)
                if (!res.ok) throw new Error('null fetch')
                if (res) user = await res.json()
                if (user) {
                    console.log($connectedAddress, user)
                    connectedUsername.set(user.username)
                }
            }
        }   
    } setTimeout(checkUser, 200)
      

    async function connectTronlink() {
        try {
			const res = await window.tronLink.request({method: "tron_requestAccounts"})
			let accounts = await window.tronLink;
			
			if (typeof res.code === 'undefined') {
				throw new Error("Login TronLink first")
				//errorMessage = 'You need to login to TronLink first, before connecting.'
			}
			connectedAddress.set(accounts.tronWeb.defaultAddress.base58)
            let user = JSON.stringify({address: accounts.tronWeb.defaultAddress.base58})
            
            const submitData = async (url) => { //sending address to express and postgres
                const res = await fetch(url, {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: user,
                })
                if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                return res
            }
            //let ifChain = await res.tronWeb.trx.getContract(chessContract)
            //if (ifChain.name) connectedChain.set(true)

            submitData(url0)
                .then(res => console.log(res))
                .catch(err => console.error(err))
            setTimeout(checkUser, 1500) 

        

			if (res.code === 4001) {
				throw new Error(`TronLink error: ${res.message}`)
			}
		} catch (error) { console.log(error) }
    }

    async function myProfile() {
        isExpanded = !isExpanded
    }


    
    async function redirectUsername() {
        if ($page.routeId == "/username") goto('./')
        else goto('./username')
        

    }

    async function redirectJoin() {
        createPrompt.set(false)
        if ($page.routeId == "/username") goto('../join')
        if ($page.routeId == '/join') goto('./')
        if ($page.routeId == '/') goto('./join')


    }

    async function tipPlayer() {
        // COMING SOON
    }


    let copied = false
    function copyClipboard() {
        navigator.clipboard.writeText($connectedAddress);
        copied = true
        setTimeout(() => {
            copied = false
        }, 4500)
    }




</script>

{#if !$connectedAddress}
    <button on:click={connectTronlink} class='rounded-[10px] border border-indigo-500 dark:border-blue-500 py-1.5 px-6 
    text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition transition-200'>
    Connect to Tronlink
    </button>


{:else if $connectedAddress && $connectedUsername}
    <button on:click={myProfile} class='relative rounded-[10px] border border-indigo-500 dark:border-blue-500 py-1.5 px-6 
    text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition transition-200'>
    {$connectedUsername}
    </button>
    {#if isExpanded}
        <div class='absolute justify-center right-12 rounded-[10px] border border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
        dark:bg-[#16161e] max-h-2/4 w-[16rem] z-100 pt-3 pl-6 pr-6 pb-3 mt-48 text-sm' transition:slide>
            <i><div>{$connectedUsername}'s account</div></i>
            <div class='flex-row'>
                <div class='flex wrap text-gray-400 hover:text-gray-500'>
                        {#if !copied}
                            <p class=' '>Address: {$connectedAddress.substring(0,5)}...{$connectedAddress.substring(29,34)}</p>
                        {:else if copied}
                            <p class=' '>Address: <i>Copied!</i></p>
                        {/if}
                            
                        
                        <button class=''on:click={copyClipboard}>
                            {#if $theme == 'dark'}
                                    <img class='ml-3' src='/img/copy-dark.svg' width='10px' height='10px' alt='Copy to clipboard'>
                            {:else if $theme == 'light'}
                                    <img class='ml-3' src='/img/copy-light.svg' width='10px' height='10px' alt='Copy to clipboard'>
                            {/if}
                        </button>
                </div>    
                <div class='text-gray-400'>Balance: {Math.round(100*$getBalance)/100} TRX</div>
            </div>
            <div class='flex wrap mt-3'>
                {#if !$inGame}
                <button on:click={createGameForm} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                dark:bg-[#16161e]  z-20 p-2 text-xs   hover:scale-[1.05] transition transition-200'>Create Game</button>
                {:else if currentRoom && $inGame || !$connectedChain}
                    <button class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                    dark:bg-[#16161e]  z-20 p-2 text-xs opacity-50' disabled>Create Game</button>
                {/if}
                {#if !$inGame}
                    <button on:click={redirectJoin} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                    dark:bg-[#16161e]  z-20 p-2 text-xs  hover:scale-[1.05] transition transition-200 '>Join Game</button>
                {:else if $inGame || !$connectedChain}
                    <button class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                    dark:bg-[#16161e]  z-20 p-2 text-xs  opacity-50' disabled>Join Game</button>
                {/if}
                <button on:click={tipPlayer} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                dark:bg-[#16161e]  z-20 p-2 text-xs opacity-50 border-opacity-50' disabled>Tip</button>
            </div>
        </div>
    {/if}
{:else if $connectedAddress}
    <button on:click={myProfile} class='rounded-[10px] border border-indigo-500 dark:border-blue-500 py-1.5 px-6 
        text-lg font-medium text-[#3C1272]dark:text-white hover:scale-[1.05] transition transition-200'>
        {$connectedAddress.substring(0,5)}...{$connectedAddress.substring(29,34)}
    </button>
    {#if isExpanded}
        <div class='absolute justify-center right-12 rounded-[10px] border border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
        dark:bg-[#16161e]  max-h-2/4 w-[16rem] z-20 pt-3 pl-6 pr-6 pb-3 mt-48 text-sm' transition:slide>
            <i><div class='animate-pulse'>{$connectedAddress.substring(0,5)}...{$connectedAddress.substring(29,34)}'s account</div></i>
            <div class='flex-row'>
                <div class='flex wrap text-gray-400 hover:text-gray-500'>
                        {#if !copied}
                            <p class=' '>Address: {$connectedAddress.substring(0,5)}...{$connectedAddress.substring(29,34)}</p>
                        {:else if copied}
                            <p class=' '>Address: <i>Copied!</i></p>
                        {/if}
                            
                        
                        <button class=''on:click={copyClipboard}>
                            {#if $theme == 'dark'}
                                    <img class='ml-3' src='/img/copy-dark.svg' width='10px' height='10px' alt='Copy to clipboard'>
                            {:else if $theme == 'light'}
                                    <img class='ml-3' src='/img/copy-light.svg' width='10px' height='10px' alt='Copy to clipboard'>
                            {/if}
                        </button>
                </div>    
                <div class='text-gray-400'>Balance: {Math.round(100*$getBalance)/100} TRX</div>
            </div>
            <div class='flex wrap mt-3'>
                <button on:click={redirectUsername} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                dark:bg-[#16161e]  z-20 p-2 text-xs  animate-pulse hover:scale-[1.16] transition transition-500' style='font-size:"2px;"'>Create Name</button>
                
                <button on:click={redirectJoin} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                dark:bg-[#16161e]  z-20 p-2 text-xs  opacity-50 border-opacity-50' disabled>Join Game</button>
                <button on:click={tipPlayer} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                dark:bg-[#16161e]  z-20 p-2 text-xs opacity-50 border-opacity-50' disabled>Tip</button>
            </div>
        </div>
    {/if}
{/if}