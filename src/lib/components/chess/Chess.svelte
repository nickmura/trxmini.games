<script>
    //@ts-nocheck
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { goto } from '$app/navigation'

    import { io } from 'socket.io-client'


    import { chessWs, urlRooms, urlEndedRooms } from '$lib/state/state' // ENDPOINTS
    const socket = io(chessWs)

    import { 
        connectedAddress,
        connectedUsername,
        chessContract,
        currentState,
    } from '$lib/state/state'

    import Chat from './Chat.svelte'

    // @ts-ignore
    import { Chess } from 'chess.js'; 
    import { turnColor, validMovesAsDests } from './app/_utils';
    import { Chessground, cgStylesHelper } from "./app/index"
    import './app/cgstyles/chessground.css';
	import { theme } from '$lib/state/Theme.svelte'



    let rooms
    let currentRoom
    let invalidRoom

    let isCheckmate
    let isDraw
    let Stalemate

    let fullGame = false
    let gameEnded = false
    let hasClicked = false
    let receivedStake = false

    let winner
    let currentTurn
    let currentTurnPlayer
    let host
    let player2
    let color


    
    async function getEndedRoom() { // Checks if currentRoom has already ended (host or someone left, etc)
       let room
       const res = await fetch(urlEndedRooms)
       if (!res.ok) return res.text().then(text => { throw new Error(text) })
       rooms = JSON.parse(await res.json())

        //@ts-ignore
        if (rooms?.find(room => room.players.includes($connectedUsername))) {
            currentRoom = rooms?.find(room => room.players.includes($connectedUsername))
            
            if (currentRoom.host) host = currentRoom.host
            if (currentRoom.player2) player2 = currentRoom.player2
            currentState.set(currentRoom.fen)
            fullGame = true
            gameEnded = true
            console.log(currentRoom)
            
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

    async function updateRooms() {
        let room
		const res = await fetch(urlRooms)
		if (!res.ok) return res.text().then(text => { throw new Error(text) })
		rooms = JSON.parse(await res.json())
        console.log($connectedUsername)
        console.log($connectedAddress)
        //Make condition to call endedRooms if rooms.find fails TODO 
        
        
        if ($connectedUsername) { //This is not runing because $connectedUsername isn't before this component via Auth.svelte
            if (rooms != null) room = rooms?.find(room => room.players.includes($connectedUsername))
            console.log(room)
            let counter = 0
            while (!room && counter < 300) {
                counter++;
                const res = await fetch(urlRooms)
		        if (!res.ok) throw new Error(res)
		        rooms = JSON.parse(await res.json())
                room = rooms?.find(room => room.players.includes($connectedUsername))
                if (room) invalidRoom = false;
                if (!room) invalidRoom - true;
            }
                if (room) {
                    socket.emit('reconnectPlayer', room)
                    currentRoom = room
                }
                host = room.host
                

            }
        

        if (room && room.players.length > 1) {
            socket.emit('reconnectPlayer', room) //No reason to grab state before game starts.
            currentRoom = room
            player2 = room.player2
            fullGame = true
            currentState.set(room.fen)
            if (player2 == $connectedUsername){
                color = 'black'
            } else if (host == $connectedUsername) {
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

    } setTimeout(updateRooms, 1000)



    function redirectJoin() {
        goto('../join')
    }
    // GAME LOGIC BELOW ---> <----
    // GAME LOGIC BELOW ---> <----
    // GAME LOGIC BELOW ---> <----
    // GAME LOGIC BELOW ---> <----

    let chess = new Chess();
    $: {
        chess = new Chess($currentState);
    }
    let cgApi
    // currentState is undefined until player joins game, which is assigned FEN value when player joins
    socket.on('playerJoined', (FEN) => {
        console.log('playerJoined')
        currentState.set(FEN)
        updateRooms()
    })

    $: config = {
        fen: $currentState,
        orientation:color ? color : 'white',
        dests: validMovesAsDests(chess),
        movable: {
            //color: 'both',
            free: false,
            dests: validMovesAsDests(chess),
            events: {after:{playOtherSide}}
        },
    };

    const playOtherSide = (orig,dest)=> {
        chess.move({from:orig,to:dest});
        cgApi.set({
            turnColor:turnColor(chess),
            movable :{
                color:color,
                dests:validMovesAsDests(chess)    
            }
        });
        isCheckmate = chess.in_checkmate()
        isDraw = chess.in_draw()
        Stalemate = chess.in_stalemate()
        currentTurn = turnColor(chess)

        socket.emit('chessMove', $connectedUsername, chess.fen())  /** Emits that a client has made a move to the other room */
        currentTurnPlayer = currentTurn === 'white' ? player2 : host;
        if (isCheckmate) {
            socket.emit('isCheckmate', currentTurnPlayer)
        } if (Stalemate && isDraw) {
            socket.emit('isStalemate', $connectedUsername)
        } if (isDraw && !Stalemate && !isCheckmate) {
            socket.emit('isDraw', $connectedUsername)
        }
    }

    socket.on('emitMove', (FEN) => { //grabs game state from other player when they make a move
        currentState.set(FEN)
    })



    function init(api) {
        api.state.movable.dests = validMovesAsDests(chess);
        // @ts-ignore
        console.log($currentState)
        updateRooms()
        cgApi = api;
        cgApi.set({
            fen:$currentState,
            lastMove:[], // clear lastMove array to avoid issues related to turn
            dests:validMovesAsDests(chess),
            turnColor:turnColor(chess),
            movable :{
                color:color,
                dests:validMovesAsDests(chess),
                events:{after:playOtherSide}
            }
        }); 
    }

    async function leaveGame() {
            currentState.set('')
            socket.emit('deleteRoom', $connectedUsername)
            goto('../')
    }

    // BUSINESS LOGIC BELOW -----><----- //
    // BUSINESS LOGIC BELOW -----><----- //
    // BUSINESS LOGIC BELOW -----><----- //
    // BUSINESS LOGIC BELOW -----><----- //

    async function collectWager(index) { // TO ALLOW PLAYER TO COLLECT WINNINGS
        // DO THIS AFTER GAME LOGIC IS SORTED OUT
    }

    async function collectDraw(index) { // TO ALLOW PLAYERS TO DRAW AND COLLECT THEIR STAKE
        // DO THIS AFTER GAME LOGIC IS SORTED OUT
    }

    async function avertGame(index) { // TO ALLOW PLAYER TO LEAVE GAME BEFORE NOBODY JOINS
        // DO THIS AFTER GAME LOGIC IS SORTED OUT
    }

</script>

<main>
    <!-- <div class='border-2 rounded-lg font-sarif fixed left-0 min-h-min p-4 mt-4 ml-14 w-1/4  dark:text-white'>
        <div class='border-b-2'>Players: 
            {#if host}{host.substring(0,4)}...{host.substring(29,34)}{/if}
            {#if player2}{player2.substring(0,4)}...{player2.substring(29,34)}{/if}
        </div>
        <div class='border-b-2'>Stake: {#if currentRoom}{currentRoom.stake} {currentRoom.token}{/if}</div>
    
        <div class='mt-2 flex flex-col max-w-[24rem] mx-auto min-h-min'>
            {#if currentRoom}
    
                <div class='flex justify-center w-full'>
                    {#if currentRoom.isCheckmate == $connectedUsername && !hasClicked && !currentRoom.redeemedStake.includes($connectedUsername)}
                        <button class='py-2 px-4 border border-transparent 
                        text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 
                        hover:scale-[1.04] transition transition-200 dark:bg-indigo-500 
                        dark:hover:bg-indigo-600 focus:outline-none focus:ring-indigo-400 w-full'
                        on:click={(e)=>collectWager(currentRoom.index)}>
                        Collect total stake</button>
                    {:else if currentRoom.isCheckmate != $connectedUsername || hasClicked 
                    || currentRoom.redeemedStake.includes($connectedUsername)}
                        <button class='py-2 px-4 border border-transparent 
                        text-sm font-medium rounded-md text-white bg-sky-600 
                         transition transition-200 dark:bg-indigo-600 
                         focus:outline-none focus:ring-indigo-400  opacity-50 w-full'
                        disabled>
                        Collect winning stakes</button>
                    {/if}
                    {#if isDraw && !hasClicked && !currentRoom.redeemedDraw.includes($connectedUsername) || Stalemate && !hasClicked && !currentRoom.redeemedDraw.includes($connectedUsername)}
                        <button class='py-2 px-4 border border-transparent 
                        text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 
                        hover:scale-[1.04] transition transition-200 dark:bg-indigo-500 
                        dark:hover:bg-indigo-600 focus:outline-none focus:ring-indigo-400  w-full'
                        on:click={(e)=>collectDraw(currentRoom.index)}>Collect draw wager</button>
                    {:else if hasClicked || !isDraw && !Stalemate || currentRoom.redeemedDraw.includes($connectedUsername)}
                        <button class='py-2 px-4 border border-transparent 
                         text-sm font-medium rounded-md text-white bg-sky-600 
                         transition transition-200 dark:bg-indigo-600 
                         focus:outline-none focus:ring-indigo-400 opacity-50 w-full'
                         disabled>Collect draw wager</button>
                    {/if}
                </div>
        
                {#if currentRoom}
                <div class='flex justify-center w-full'>
                        {#if currentRoom.isCheckmate != $connectedUsername && currentRoom.isCheckmate || currentRoom.redeemedStake.includes($connectedUsername) && currentRoom.redeemedStake || currentRoom.redeemedDraw.includes($connectedUsername) && currentRoom.redeemedDraw|| receivedStake}
                            <button class='py-2 px-4 border border-transparent 
                            text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 
                            hover:scale-[1.04] transition transition-200 dark:bg-indigo-500 
                            dark:hover:bg-indigo-600 focus:outline-none focus:ring-indigo-400 mt-2 w-full' on:click={leaveGame}>
                            Leave Game
                        </button>
                        {:else}
                            <button class='py-2 px-4 border border-transparent 
                            text-sm font-medium rounded-md text-white bg-sky-600  
                            transition transition-200 dark:bg-indigo-600 
                            focus:outline-none focus:ring-indigo-400 mt-2 opacity-50 w-full' disabled>
                            Leave Game
                            </button>
                        {/if}
                        {#if currentRoom.players.length < 2 && !hasClicked && !currentRoom.redeemedDraw.includes($connectedUsername)}
                            <button class='py-2 px-4 border border-transparent 
                            text-sm font-medium rounded-md text-white bg-gray-400  
                            hover:scale-[1.04] transition transition-200 
                            hover:bg-red-800 focus:outline-none focus:ring-indigo-400 mt-2 w-full'
                            on:click={(e)=>avertGame(currentRoom.index)}>
                            Avert Game
                            </button>
                        {:else}
                            <button class='py-2 px-4 border border-transparent 
                                text-sm font-medium rounded-md text-white bg-gray-500  
                                transition transition-200
                                focus:outline-none focus:ring-indigo-400 mt-2 w-full opacity-50'
                                disabled>
                            Avert Game
                            </button>
                        {/if}
                </div>
                {/if}
    
            {/if}
                
        </div>
        {#if winner}
            <div class='mt-4'>{winner} won by checkmate!</div>
        {/if}
        {#if Stalemate || isDraw}
            <div class='mt-4'>The game is a stalemate! (draw)</div>
        {/if}
    
        {#if isDraw && !Stalemate}
            <div class='mt-4'>The game is a draw!</div>
        {/if}
    </div> -->
    <div class='flex justify-center px-4 py-8'>
        {#if !invalidRoom}
        <div transition:slide></div>
        {:else}
            <div class='flex justify-center flex-wrap absolute font-semibold text-3xl text-center w-[30rem] z-20 my-52 ' transition:slide>
                You currently are not in a game! <button on:click={redirectJoin} class='hover:scale-[1.07] transition transition-200 hover:underline hover:text-blue-400 mr-2.5'>Click here</button> to create join one.</div>
        
        {/if}
        {#if currentRoom}
            <div class='border rounded-lg dark:border-blue-500 border-indigo-500 h-fit w-[24rem] font-semibold'>
                <div class='mx-4 px-2 py-4 border-b dark:border-blue-800 border-indigo-800'>Players: {host ? `${host}` : ''} {player2 ? `, ${player2}` : ``}</div>
                <div class='mx-4 px-2 py-4 border-b dark:border-blue-800 border-indigo-800'>Current Turn: {currentTurnPlayer ? currentTurnPlayer : ''} {$connectedUsername === currentTurnPlayer ? '(Your turn)' : ''}</div>
                <div class='mx-4 px-2 py-4 border-b mb-8 dark:border-blue-800 border-indigo-800'>Stake: {currentRoom ? `${currentRoom.stake} TRX`: currentRoom && player2 ? `${currentRoom.stake * 2} TRX`: ''} {$connectedUsername === currentTurnPlayer ? '(Your turn)' : ''}</div>
                <button class="ml-2 rounded-[10px] border border-indigo-500 dark:border-red-500 
                py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                transition-200" on:click={leaveGame}>Cancel</button>
            </div>
        {:else if !currentRoom}
            <div class='border rounded-lg dark:border-blue-500 border-indigo-500 h-fit w-[24rem] font-semibold dark:opacity-30 opacity-50'>
                <div class='mx-4 px-2 py-4 border-b dark:border-blue-800 border-indigo-800'>Players: </div>
                <div class='mx-4 px-2 py-4 border-b dark:border-blue-800 border-indigo-800'>Current Turn: {currentTurnPlayer ? currentTurnPlayer : ''} {$connectedUsername === currentTurnPlayer ? '(Your turn)' : ''}</div>
                <div class='mx-4 px-2 py-4 border-b mb-8 dark:border-blue-800 border-indigo-800'>Stake: {currentRoom ? `${currentRoom.stake} TRX`: currentRoom && player2 ? `${currentRoom.stake * 2} TRX`: ''} {$connectedUsername === currentTurnPlayer ? '(Your turn)' : ''}</div>
                
            </div>
        {/if}
        <div class='ml-12 shadow-xl'>
            
            {#if $theme == 'dark' && currentRoom}
                <div
                    use:Chessground={{ config, initializer: init }}
                    class="blue transition transition-200"
                    use:cgStylesHelper={{
                        piecesFolderUrl: '/chess/images/pieces/merida',
                        boardUrl: '/chess/images/board/purple.svg'
        
                    }}
                    style="height: 540px; width: 540px;" 
                />
            {:else if $theme == 'dark' && !currentRoom}
                <div
                use:Chessground={{ config, initializer: init }}
                class="blue transition transition-200 opacity-30"
                use:cgStylesHelper={{
                    piecesFolderUrl: '/chess/images/pieces/merida',
                    boardUrl: '/chess/images/board/purple.svg'

                }}
                style="height: 540px; width: 540px;" 
                />
            {/if}
            {#if $theme == 'light' && currentRoom}
                <div
                use:Chessground={{ config, initializer: init }}
                class="blue transition transition-200"
                use:cgStylesHelper={{
                    piecesFolderUrl: '/chess/images/pieces/merida',
                    boardUrl: '/chess/images/board/blue.svg'
    
                }}
                style="height: 540px; width: 540px;" 
                />
            {:else if $theme == 'light' && !currentRoom}
                <div
                use:Chessground={{ config, initializer: init }}
                class="blue transition transition-200 opacity-50"
                use:cgStylesHelper={{
                    piecesFolderUrl: '/chess/images/pieces/merida',
                    boardUrl: '/chess/images/board/blue.svg'

                }}
                style="height: 540px; width: 540px;" 
                />
            {/if}
        </div>
    
        <!-- <div class='font-sarif fixed right-0 min-h-min min-w-fit pt-2.5 pr-2.5 w-1/4'>
            <Chat></Chat>
        </div> -->
    </div> 
    <style>
        :global(.cg-wrap coords.files) {
            bottom: 0;
            text-align: right;
        }
    
        :global(.cg-wrap coords) {
            font-weight: bold;
        }
    
        div {
            --cg-ccw: #dee3e6;
            --cg-ccb: #8ca2ad;
        }
    </style>
</main>