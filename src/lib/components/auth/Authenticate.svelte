<script lang='ts'>


    import { beforeUpdate, onMount } from 'svelte'
    import { slide } from 'svelte/transition'

    import { browser } from '$app/environment'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'


    import { theme } from '$lib/state/Theme.svelte'
    import type { Rooms } from '$lib/state/state'
    import { urlRooms, urlEndedRooms, url0, url1, url2, tipSocket, getXp, authPrompt, notificationsUrl, defaultUsername } from '$lib/state/state'
    import { 
        connectedAddress, 
        connectedUsername,
        userID,
        connectedChain,
        createPrompt, 
        tipPrompt, 
        tipPlayerForm,
        chessContract,
        createGameForm,
        getBalance,
        inGame,
        medalAlert,
        playerNotifications,
        getDomains,
        trxDomains,
        

    } from '$lib/state/state'
    


    interface User {
        address: string,
        defaultusername: string,
        hasWon8Ball: boolean,
        username: string,
        xp: number
    }


    import { getLevel } from '$lib/state/level'

    let isExpanded = false
    let medal8Ball = false
    
    let user:User
    let userLevel:number
    let levelProgress:number // for progress bar
    let rooms:Rooms[]
    let currentRoom
    
    let profileLink:string
    async function check() { 
        try {
            if (browser) {
                //@ts-ignore
                const res = await window.tronLink
                //console.log(res)
                if (res) {
                    if (res.tronWeb == undefined || res.tronWeb === false) { 
                        connectedAddress.set('')
                    } if (res.tronWeb) {
                        connectedAddress.set(res.tronWeb.defaultAddress.base58)
                        let ifChain = await res.tronWeb.trx.getContract(chessContract)
                        if (ifChain.name) { 

                            connectedChain.set(true)
                        }



                        const userNotification = JSON.stringify({address: $connectedAddress, name: $connectedUsername})
                        const getNotifications = async (url:string) => { // sending address to express and postgres
                        const res = await fetch(url, {
                            method: 'post',
                            headers: {'Content-Type': 'application/json'},
                            body: userNotification,
                        })
                        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                        
                        playerNotifications.set(await res.json())
                        //console.log('$playerNotifications', $playerNotifications)
                        return res
                    } 

                    getNotifications(notificationsUrl)
                        //.then(res => console.log(res.json()))
                        .catch(err => console.error(err))
                    }
                    

                    
                }
            }
        } catch (error) {
            console.log(error)
        }
    } 
    setTimeout(check, 250)
    
    
    async function updateRooms() {
        let room:Rooms | undefined
        let testaddr
		const res = await fetch(urlRooms)
		if (!res.ok) return res.text().then(text => { throw new Error(text) })
		else rooms = JSON.parse(await res.json())
        

            if (rooms != null && rooms.length && rooms != undefined) {
            if (rooms?.find(room => room.players.includes($connectedUsername))) {
                room = rooms.find(room => room.players.includes($connectedUsername))
            
                if (room) { 
                    inGame.set(true)
                    currentRoom = true
                } else {
                    inGame.set(false)
                    currentRoom = false
                }
            }
            }
            //console.log('inGame', $inGame)
              
        
    } setTimeout(() => {
        if ($connectedAddress && $connectedUsername) updateRooms()
    }, 1000)

    

    
    async function getEndedRoom() { // Checks if currentRoom has already ended (host or someone left, etc)
       let room
       const res = await fetch(urlEndedRooms)
       if (!res.ok) return res.text().then(text => { throw new Error(text) })
       rooms = JSON.parse(await res.json())

        //@ts-ignore
        
        if (rooms?.find(room => room.players.includes($connectedUsername))) {
            currentRoom = rooms?.find(room => room.players.includes($connectedUsername))
            if (room) { 
                inGame.set(true)
                currentRoom = true
            } else {
                inGame.set(false)
                currentRoom = false
            }
            
        }
       
    } setTimeout(getEndedRoom, 1100)


    async function checkUser() {
        if (browser) {
            //@ts-ignore
            const res = await window.tronLink 
            if (res.tronWeb) connectedAddress.set(res.tronWeb.defaultAddress.base58)
            //@ts-ignore
            getBalance.set(await window.tronWeb.trx.getBalance($connectedAddress) / 1000000)

            if ($connectedAddress) {
                
                const url2 = `http://146.190.244.186:5001/username?addr=${$connectedAddress}`
                const res = await fetch(url2)
                if (!res.ok) throw new Error('null fetch')
                if (res) user = await res.json()
                if (user) {
                    console.log(user)
                    userLevel = await getLevel(user.xp);
                    levelProgress = userLevel - Math.floor(userLevel)

                    levelProgress = Math.round(levelProgress * 100)


                    if (user.hasWon8Ball == true) {
                        medal8Ball = true
                        if (!localStorage.getItem('hasSeenMedal')) {
                            medalAlert.set(true)
                            
                        }
                    }
                    connectedUsername.set(user.username)
                    defaultUsername.set(user.defaultusername)
                    if ($connectedUsername) {
                        userID.set($connectedUsername)
                        profileLink = `/profile/${$connectedUsername}`
                    } else {
                        userID.set($connectedAddress)
                    }
                }
                //console.log($userID)
            }
        }   
    } setTimeout(checkUser, 300)
      

    async function connectTronlink() {
        try {
            //@ts-ignore
			const res = await window.tronLink.request({method: "tron_requestAccounts"})
            //@ts-ignore
			let accounts = await window.tronLink;
			
			if (typeof res.code === 'undefined') {
				throw new Error("Login TronLink first")
				//errorMessage = 'You need to login to TronLink first, before connecting.'
			}
			connectedAddress.set(accounts.tronWeb.defaultAddress.base58)
            let user = JSON.stringify({address: accounts.tronWeb.defaultAddress.base58})
            
            const submitData = async (url:string) => { // sending address to express and postgres
                const res = await fetch(url, {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: user,
                })

                if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                return res
            }
            submitData(url0)
                .then(res => console.log(res))
                .catch(err => console.error(err))
                
            setTimeout(checkUser, 1500)
            console.log(res)
            let ifChain = await res.tronWeb.trx.getContract(chessContract)

            if (ifChain.name) { 
                //console.log('name of contract', ifChain.name)
                connectedChain.set(true)
            }
    
			if (res.code === 4001) {
				throw new Error(`TronLink error: ${res.message}`)
			}
		} catch (error) { console.log(error) }
    }


    async function myProfile() {
        authPrompt.set(!$authPrompt)
    }


    
    async function redirectUsername() {
        if ($page.routeId == "/username") goto('./')
        else goto('./username')
        

    }

    async function redirectJoin() {
        createPrompt.set(false)
        if ($page.routeId != null) {
            if ($page.routeId == "/username") goto('../join')
            if ($page.routeId.includes('/profile/')) goto('../../join')
            if ($page.routeId == '/join') goto('./')
            if ($page.routeId == '/') goto('./join')
        }
    }

    async function tipPlayer() {
        // NOW IMPORTED AS tipPlayerForm
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
    text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition transition-200 z-10 '>
    {$connectedUsername}
    </button>
    {#if $authPrompt}

        <div class='absolute justify-center right-12 rounded-[10px] border border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
        dark:bg-[#16161e] bg-[#f2f0eb] max-h-2/4 w-[16rem] z-60  mt-60 text-sm' transition:slide>
            <div class='absolute flex justify-end w-full'>
                <!-- <img src='/img/8ball_medal.png' alt='medal' class='w-8 h-8 mt-1 mr-1'> -->
                {#if medal8Ball}
                    {#if $theme == 'dark'}
                        <div class='absolute tooltip m w-8 w-8 mt-1 mr-1' ><img src='/img/8ball_medal.png' alt='medal' class=' mt-1 mr-1'><div class='border border-blue-500 max-h-fit w-44 pl-2 pr-2 z-50 rounded-lg bg-[#16161d] text-xs text-center tooltipinfo'>
                            <div><b><u>8 Ball Medal</u></b></div>
                            This badge is a certification for beating our AI at 8ball. Thank you for participating in the challenge.
                            <div class='text-bold'><b>This badge certifies you for exclusive future rewards and benefits on our platform! Thanks for being a supporter!</b></div>
                        </div></div>
                    {:else}
                        <div class='absolute tooltip m w-8 w-8 mt-1 mr-1' ><img src='/img/8ball_medal.png' alt='medal' class=' mt-1 mr-1'><div class='border border-blue-500 max-h-fit w-44 p-5 z-50 rounded-lg bg-[#EFECE6] text-xs text-center tooltipinfo z-20'>
                            This badge is a certification for beating our AI at 8ball. Thank you for participating in the challenge.
                            <div class='text-bold'><b>This badge certifies you for exclusive future rewards and benefits on our platform! Thanks for being a supporter!</b></div>
                        </div></div>
                    {/if}
                {/if}
            </div>
            <div class='pl-6 pr-6 pt-3  pb-3'>
                <i><div class='hover:scale-[1.05] transition transition-200 hover:text-amber-400 animate-pulse'><a href={profileLink} ><u>{$connectedUsername}'s account</u></a></div></i>

                <div class='flex-row '>
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
                    <div class=''>
                        <div class='w-full bg-gray-700 h-[0.5px] mt-2'></div>
                        <div class='text-gray-400 flex justify-center mt-2 pointer-events-none'>Level: {Math.floor(userLevel)}</div>
                        <!-- <progress class='rounded-lg' id="file" max="100" value={levelProgress}></progress> -->
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-700 mt-2 hover:animate-pulse pointer-events-none">
                            <div class="bg-gray-700 h-1.5 rounded-full dark:bg-gray-100" style={levelProgress ? `width: ${levelProgress}%` : ''}></div>
                        </div>
                    </div>
                </div>
                <div class='flex wrap mt-3 '>
                    {#if !$inGame || $inGame}
                        <button on:click={createGameForm} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                        dark:bg-[#16161e]  z-20 p-2 text-xs   hover:scale-[1.05] transition transition-200'>Create Game</button>
                    {/if}
                    {#if !$connectedChain}
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
                    <button on:click={tipPlayerForm} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                    dark:bg-[#16161e]  z-20 p-2 text-xs '>Tip</button>
                </div>
            </div>
        </div>
    {/if}
{:else if $connectedAddress}
    <button on:click={myProfile} class='rounded-[10px] border border-indigo-500 dark:border-blue-500 py-1.5 px-6 
        text-lg font-medium text-[#3C1272]dark:text-white hover:scale-[1.05] transition transition-200'>
        {$connectedAddress.substring(0,5)}...{$connectedAddress.substring(29,34)}
    </button>
    {#if $authPrompt}
        <div class='absolute justify-center right-12 rounded-[10px] border border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
        dark:bg-[#16161e] bg-[#f2f0eb]  max-h-2/4 w-[16rem] z-20 pt-3 pl-6 pr-6 pb-3 mt-48 text-sm' transition:slide>
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
                <button on:click={createGameForm} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                    dark:bg-[#16161e]  z-20 p-2 text-xs   hover:scale-[1.05] transition transition-200'>Create Game</button>
                <button on:click={redirectJoin} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                dark:bg-[#16161e]  z-20 p-2 text-xs  opacity-50 border-opacity-50' disabled>Join Game</button>
                <button on:click={tipPlayerForm} class='rounded-[10px] border mr-1 border-indigo-500 dark:border-blue-500 border text-black dark:text-white  
                dark:bg-[#16161e]  z-20 p-2 text-xs opacity-50 border-opacity-50' disabled>Tip</button>
            </div>
        </div>
    {/if}
{/if}
<style>
    .tooltip .tooltipinfo {
    visibility: hidden;
    padding: 5px 0;
}

.tooltip:hover .tooltipinfo {
    visibility: visible;
}
</style>