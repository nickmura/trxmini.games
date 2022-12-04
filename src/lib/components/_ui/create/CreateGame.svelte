<script>
    //@ts-nocheck
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { browser } from '$app/environment'
    import { theme } from '$lib/state/Theme.svelte'
    import { url0, url1, makeBallRoom, chessWs, inGame, creatingGame } from '$lib/state/state'

    import { io } from 'socket.io-client'
    const socket = io(chessWs)

    
    import { 
        connectedAddress, 
        connectedUsername, 
        userID,
        createPrompt, 
        selectedOption, 
        createGameForm,
        getBalance,
        chessContract
    } from '$lib/state/state'



    let username 
    let balanceInterval

    let user
    let stakeValue
    let isWagerless = false
    $: console.log(isWagerless)
    let errorHandling
    let setUsername = false
    let isUnique = true
    //$: isUnique
    let init = false
    
    let hasClicked = false
    $: hasClicked



    let infoExpanded = false
    function infoDialog() {
        infoExpanded = !infoExpanded
    }

    let isExpanded
    async function selectGame() {
        isExpanded = !isExpanded
    }

    function assignChess() {
        selectedOption.set('Chess')
        isExpanded = !isExpanded
    }
    function assignDrawades() {
        selectedOption.set('Drawades')
        isExpanded = !isExpanded
    }
    function assign8Ball() {
        selectedOption.set('8 Ball')
        isExpanded = !isExpanded
    }
    let getBalanceInterval



    async function createGame(info) {
        // DO THIS LOGIC

        // FOR 8 BALL 
        if ($selectedOption == '8 Ball') {
            isWagerless = true
            console.log('test')

            if ($page.routeId == '/username' || $page.routeId == '/join') goto('../8ball')
            
                else if ($page.routeId == '/8ball') goto('./')
                else {
                    goto('./8ball')
                    
                }
            const res = await fetch(makeBallRoom + $connectedUsername)
            if (!res.ok) throw new Error('null fetch')
        }
        //FOR CHESS
        if ($selectedOption == 'Chess') {
            try {
                let room
                hasClicked = true
                errorHandling = ''
                let uuid = Math.floor(Math.random()*1000000) // gameID
                if (!isWagerless) {
                    let price = stakeValue * 1000000 // format in proper denomination


                    // parameters for function call...
                    var parameter = [{type:'uint32',value:uuid},{type:'address', value:$connectedAddress}, {type:'uint256', value:price}]
                    var options = {
                        feeLimit:100000000,
                        callValue: price
                    } 
                    
                    // invoking function with parameters declared above
                    const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                        window.tronWeb.address.toHex(chessContract), "startGame(uint32,address,uint256)", 
                        options, parameter, window.tronWeb.address.toHex($connectedAddress))
                    const signedTx = await tronWeb.trx.sign(tx.transaction);
                    const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx); 
                }
                // room parameters for the server to index and update server side
                if (!isWagerless) {
                    room = {
                        gameID: uuid, 
                        game: 'chess', 
                        players: [$userID], 
                        host: `${$userID}`,
                        player2: ``, 
                        chat: [],
                        orientation: ``, // For when the game ends, client can know what the orientation was.
                        fen: '',
                        isCheckmate: '', 
                        isStalemate: '',
                        isDraw: '', 
                        stake: `${stakeValue}`, 
                        token: 'TRX', 
                        index: ``,
                        currentTurn: $userID,
                        wagerTxs: [],
                        redeemedStake: [],
                        redeemedDraw: [],
                    }
                } else if (isWagerless) {
                    room = {
                        gameID: uuid, 
                        game: 'chess', 
                        players: [$userID], 
                        host: `${$userID}`,
                        player2: ``, 
                        chat: [],
                        orientation: ``, // For when the game ends, client can know what the orientation was.
                        fen: '',
                        isCheckmate: '', 
                        isStalemate: '',
                        isDraw: '', 
                        stake: `0`, 
                        token: 'TRX', 
                        index: ``,
                        currentTurn: $userID,
                        wagerTxs: [],
                        redeemedStake: [],
                        redeemedDraw: [],
                    }
                }

                socket.emit('createRoom', uuid, room)
                createPrompt.set(false)
                inGame.set(true)
                sessionStorage.setItem('inGame', true)
                if ($page.routeId == '/username' || $page.routeId == '/join') goto('../chess')
                else if ($page.routeId == '/chess') goto('./')
                else {
                    goto('./chess')
                    
                }
                // sendEvents(uuid)

            } catch (error) {
                console.log(error)
                hasClicked = false
            }
        }
    }

</script>


<div id="container" class:show={$createPrompt}>
						
    <div id="exampleModal" class="reveal-modal border dark:border-blue-500 border-indigo-500 text-black opacity-[98] bg-[#ECECEA] dark:bg-[#111112] dark:text-white 
    shadow-xl
    rounded-lg p-6">

        <h2 class='title font-semibold'>Create a game</h2>
        {#if errorHandling}
            {errorHandling}
        {/if}
        <div class=''>
            <div class='flex justify-center h-[16rem] mt-3 '>
                <div class='border border-[#b3b2b1] dark:border-zinc-700 
                rounded-lg w-full'>
                    <div class='flex p justify-end'>
                        {#if $theme == 'dark'}
                            <div class=' w-4 h-4 absolute tooltip m' ><img src='/img/info_dark.svg' alt='Info box. click'><div class='border border-blue-500 max-h-fit w-44 pl-2 pr-2  rounded-lg bg-[#16161d] text-xs text-center tooltipinfo'>
                                Click the game you want to play. Then, add the stake you want to play with in TRX! Currently, we only have chess available on our protocol, but we are working hard to add larger, more multiplayer games into our protocol as soon as possible!
                                <div>NOTICE: Clicking wagerless will allow you to play stakeless; A free game!</div>
                            </div></div>
                        {:else}
                            <div class=' w-4 h-4 absolute tooltip m' ><img src='/img/info.svg' alt='Info box. click'><div class='border border-blue-500 max-h-fit w-44 p-5 rounded-lg bg-[#EFECE6] text-xs text-center tooltipinfo z-20'>
                                Click the game you want to play. Then, add the stake you want to play with in TRX! Currently, we only have chess available on our protocol, but we are working hard to add larger, more multiplayer games into our protocol as soon as possible!
                                <div>NOTICE: Clicking wagerless will allow you to play stakeless; A free game!</div>
                            </div></div>
                        {/if}
                    </div>
                    <div class='flex justify-center'>
                        {#if $getBalance < stakeValue && !isWagerless}
                            <div class='absolute text-sm text-red-400 top-[4.3rem] italic max-w-3/4 w-[15rem] text-center text-red-400 dark:hover:text-red-200' transition:slide>
                                Insufficient balance for wager input.
                            </div>
                        {:else if stakeValue > $getBalance - 16 && !isWagerless}
                            <div class='absolute text-sm text-red-400 top-[4rem] italic w-[15rem] text-center text-red-400 dark:hover:text-red-200' transition:slide>
                                Insufficient balance - you need at least 16 TRX to pay for fees.
                            </div>
                        {:else if stakeValue < 10 && !isWagerless}
                            <div class='absolute text-sm text-red-400 top-[4rem] italic w-[15rem] text-center text-red-400 dark:hover:text-red-200' transition:slide>
                                Insufficient balance - minimum wager is 10 TRX
                            </div>
                        {:else if $selectedOption == '8 Ball' && !$connectedUsername}
                            <div class='absolute text-sm text-red-400 top-[4rem] italic w-[15rem] text-center text-red-400' transition:slide>
                                You need to create a TRX username first to play 8 Ball. <a href='/username' class='hover:text-red-200 hover:scale-[1.05] underline'> Click here</a>
                            </div>
                        {:else if $selectedOption == 'Chess' && !isWagerless && hasClicked}
                            <div class='absolute text-sm text-red-400 top-[4rem] italic w-[15rem] text-center text-green-400' transition:slide>
                                Creating a wagered chess game for {stakeValue} TRX...
                            </div>
                        {:else if $selectedOption == 'Chess' && isWagerless && hasClicked}
                            <div class='absolute text-sm text-red-400 top-[4rem] italic w-[15rem] text-center text-green-400' transition:slide>
                                Creating a wagerless chess game ...
                            </div>
                        {:else}
                            <div ></div>
                        {/if}
                    </div>
                    <div class='flex wrap py-12 px-8 flex justify-center mx-2 ml-2 border-b border-[#535754]'>
                        <div class='font-semibold mt-1.5 mr-2'>Game: </div>
                            <button class="border border-[#b3b2b1] rounded-lg py-1.5 px-6" on:click|stopPropagation={selectGame}>
                                <div class='flex justify-between w-full'>
                                    {$selectedOption}
                                    {#if $theme == 'dark'}
                                        <svg class="h-6 w-6 text-indigo-500 relative flex-end group-hover:text-indigo-400" fill='white' width="48" height="48" viewBox="0 0 48 48">
                                            <path d="M14 20l10 10 10-10z"/>
                                            <path d="M0 0h48v48h-48z" fill="none"/>
                                        </svg>
                                    {:else}
                                        <svg class="h-6 w-6 text-indigo-500 relative flex-end group-hover:text-indigo-400"  width="48" height="48" viewBox="0 0 48 48">
                                            <path d="M14 20l10 10 10-10z"/>
                                            <path d="M0 0h48v48h-48z" fill="none"/>
                                        </svg>
                                    {/if}
                                </div>
                            </button>
                            {#if isExpanded}
                                <ul class='top-8 absolute z-50 inset-x-32 ml-3 border-[#b3b2b1] top-36 mt-2 bg-[#edece6] dark:bg-[#111112] rounded-lg text-black dark:text-[#edece6] pl-1 w-24 pr-1 pb-1 pt-1 border  'transition:slide>
                                    <div class='flex flex-col '>
                                        <button class="pl-1 pr-1 rounded-sm dark:hover:bg-[#2b2b36] hover:bg-[#c4c4be] hover:scale-[1.03] transition transition-200" on:click={assignChess}>Chess</button>
                                        <button class="pl-1 pr-1 rounded-sm" on:click={assign8Ball} >8 Ball</button>
                                        <button class="pl-1 pr-1 rounded-sm opacity-50 " on:click={assignDrawades} disabled>Drawades</button>
                                    </div>
                                </ul>
                            {/if}
                        </div>
                    <div class='flex justify-between'>
                        <div class='ml-2  text-[10px] text-[#b6bab7] animate-pulse'>
                            {#if stakeValue > 9}
                                Wager: {stakeValue} TRX
                            {/if}
                        </div>
                        <div class='mr-2 text-[10px] text-[#b6bab7]'><i>Balance: {Math.round(100*$getBalance)/100} TRX</i></div>
                    </div>
                    <div class=' font-semibold flex justify-center py-6 px-4 '>
                    {#if !isWagerless && $selectedOption != '8 Ball'}
                        <div class='mt-1.5 mr-2'>Stake:</div>
                            <input bind:value={stakeValue} id="stake" min='0' name="stake" type='number' required class="relative px-3 py-1.5 
                            border dark:bg-[#111112] bg-[#EDEDE8] w-32 border-gray-300 placeholder-gray-500 dark:text-white dark:placeholder-gray-450 bg-gray-100 rounded-lg focus:outline-none 
                            focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-light" placeholder="Enter a wager">

                    {:else}

                        <div class='mt-1.5 mr-2 opacity-50'>Stake:</div>
                        <input bind:value={stakeValue} id="stake" min='0' name="stake" type='number' required class="relative px-3 py-1.5 
                        border dark:bg-[#111112] bg-[#EDEDE8] w-32 border-gray-300 placeholder-gray-500 dark:text-white dark:placeholder-gray-450 bg-gray-100 rounded-lg focus:outline-none 
                        focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-light opacity-50"  placeholder="Enter a wager" disabled>

                    {/if} 

                    </div>
                    {#if $selectedOption != '8 Ball'}
                        <div class='justify-center flex -py-2'>
                            Wagerless:<input class='ml-2' type='checkbox' bind:checked={isWagerless}>
                        </div>
                    {:else if $selectedOption == '8 Ball'}
                        <div class='justify-center flex -py-2 opacity-50'>
                            Wagerless:<input class='ml-2' type='checkbox' bind:checked={isWagerless} disabled>
                        </div>
                    {/if}
                    
                </div>  
                
            </div>
        </div>
        <!-- svelte-ignore a11y-invalid-attribute -->
        <div class='absolute inset-x-0 bottom-0 mb-4 ml-4 mr-[1.5rem]'>
            <div class='flex justify-between'>
                <button class="ml-2 rounded-[10px] border border-indigo-500 dark:border-red-500 
                py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                transition-200" on:click={createGameForm}>Cancel</button>

                <!-- Change last and operator to stakeValue > 49 -->
                {#if stakeValue && stakeValue < $getBalance - 16 && !hasClicked && stakeValue > 9 || isWagerless || $selectedOption == '8 Ball' && $connectedUsername}  
                    <button on:click={(e)=>createGame(username)} class=' rounded-[10px] border 
                        border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500
                        py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                        transition-200'>Create Game</button>
                
                {:else if hasClicked}
                    <button on:click={(e)=>createGame(username)} class=' rounded-[10px] 
                        border border-emerald-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] 
                        dark:text-white scale-[1.05] opacity-80
                        ' disabled> 
                        Create Game
                    </button>
                {:else if !stakeValue || stakeValue > $getBalance || stakeValue > $getBalance - 16 || stakeValue < 50 }
                    <button on:click={(e)=>createGame(username)} class=' rounded-[10px] border border-[#b3b2b1] 
                        py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white opacity-50' disabled> 
                        Create Game
                    </button>
                {/if}
            </div>
            
        </div>
    </div>
</div>



<style>
#container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    visibility:hidden;
    display:none;
    /* background-color: rgba(22,22,22,0.5); */
}

#container.show {
    z-index: 48;
    visibility: visible;
    display: block;
}

.reveal-modal {
    margin: 0 auto;
    width:320px; 
    height: 400px;
    position:relative;
    
    z-index:100;
    top: 25%;
    /* padding:30px;  */
    /* -webkit-box-shadow:0 0 10px rgba(0,0,0,0.4);
    -moz-box-shadow:0 0 10px rgba(0,0,0,0.4); 
    box-shadow:0 0 10px rgba(0,0,0,0.4); */
}
.title {
    display: flex;
    justify-content: center;
}
/* .between {
    display: flex;
    margin-top: 1rem;
    justify-content: space-between;
} */

.tooltip .tooltipinfo {
    visibility: hidden;
    padding: 5px 0;
}

.tooltip:hover .tooltipinfo {
    visibility: visible;
}
</style>