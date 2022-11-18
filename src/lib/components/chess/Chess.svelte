<script>
    //@ts-nocheck
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { goto } from '$app/navigation'
    import { browser } from '$app/environment'
    import { io } from 'socket.io-client'


    import { chessWs, urlRooms, urlEndedRooms } from '$lib/state/state' // ENDPOINTS
    const socket = io(chessWs)

    import { 
        connectedAddress,
        connectedUsername,
        chessContract,
        currentState,
        inGame,
        creatingGame,
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

    async function updateRooms() {
        let room
		const res = await fetch(urlRooms)
		if (!res.ok) return res.text().then(text => { throw new Error(text) })
		rooms = JSON.parse(await res.json())
        console.log($connectedUsername)
        //console.log($connectedUsername)
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
                    inGame.set(true)
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
            currentTurn = room.currentTurn
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

    async function updateRooms2() {
        let room
		const res = await fetch(urlRooms)
		if (!res.ok) throw new Error(res)
		else rooms = JSON.parse(await res.json())

        //Make condition to call endedRooms if rooms.find fails TODO 
        if ($connectedUsername ) { //This is not runing because $connectedUsername  isn't before this component via Auth.svelte
            if (rooms != null) room = rooms.find(room => room.players.includes($connectedUsername ))
            while (!room) {
                const res = await fetch(urlRooms)
		        if (!res.ok) throw new Error(res)
		        rooms = JSON.parse(await res.json())
                room = rooms?.find(room => room.players.includes($connectedUsername ))
            }
                if (room) {
                    socket.emit('reconnectPlayer', room)
                    currentRoom = room
                }
                host = room.host
                console.log(currentRoom)

            }
        

        if (room && room.players.length > 1) {
            socket.emit('reconnectPlayer', room) //No reason to grab state before game starts.
            currentRoom = room
            player2 = room.player2
            fullGame = true
            currentState.set(room.fen)
            if (player2 == $connectedUsername ){
                color = 'black'
            } else if (host == $connectedUsername ) {
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
            console.log(Stalemate)
        } 

    } updateRooms2()

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


    socket.on('emitMove', (FEN, turn) => {
        currentState.set(FEN)
        currentTurnPlayer = turn
    })

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
            sessionStorage.removeItem('inGame')
            goto('../')
    }

    // BUSINESS LOGIC BELOW -----><----- //
    // BUSINESS LOGIC BELOW -----><----- //
    // BUSINESS LOGIC BELOW -----><----- //
    // BUSINESS LOGIC BELOW -----><----- //
    let isNotGame = false
    if (browser && !sessionStorage.getItem('inGame')) {
            isNotGame = true
    }

    async function collectWager(index) {
        try {
            hasClicked = true
            //let index = parseInt(index)
            var parameter = [{type:'uint',value:index}]
            var options = {
                feeLimit: 100000000,

            }

            // invoking contract function
            const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                window.tronWeb.address.toHex(chessContract), "payWager(uint256)",
                options, parameter, window.tronWeb.address.toHex($connectedAddress))
            const signedTx = await tronWeb.trx.sign(tx.transaction);
            const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx); 
            
            socket.emit('redeemedStake', $connectedUsername)
            receivedStake = true
            
        } catch (error) {
            hasClicked = false
        }
    }
    async function collectDraw(index) {
        try {
            hasClicked = true
            //let index = parseInt(index)
            var parameter = [{type:'uint',value:index}]
            var options = {
                feeLimit: 100000000,

            }

            // invoking contract function
            const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                window.tronWeb.address.toHex(chessContract), "payDraw(uint256)",
                options, parameter, window.tronWeb.address.toHex($connectedAddress))
            const signedTx = await tronWeb.trx.sign(tx.transaction);
            const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx); 
            
            socket.emit('redeemedDraw', $connectedUsername)
            receivedStake = true
        } catch (error) {
            hasClicked = false
        }
    }

    async function avertGame(index) {
        try {
            hasClicked = true
            //let index = parseInt(index)
            var parameter = [{type:'uint',value:index}]
            var options = {
                feeLimit: 100000000,

            }

            // invoking contract function
            const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                window.tronWeb.address.toHex(chessContract), "forfeit(uint256)",
                options, parameter, window.tronWeb.address.toHex($connectedAddress))
            const signedTx = await tronWeb.trx.sign(tx.transaction);
            const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx); 
            
            socket.emit('avertGame', $connectedUsername)
            receivedStake = true
        } catch (error) {
            hasClicked = false
        }
    }
</script>

<main>

    <div class='flex justify-between py-12'>
        {#if currentRoom}
            <div class='border rounded-lg dark:border-blue-500 border-indigo-500 h-fit w-[24rem] font-semibold'>
                <div class='flex justify-end font-sarif'>
                    {#if $theme == 'dark'}
                        <div class=' w-4 h-4 absolute tooltip m z-20' ><img src='/img/info_dark.svg' alt='Info box. click'><div class='border border-blue-500 max-h-fit w-52 p-5 rounded-lg bg-[#16161d] text-xs text-center tooltipinfo z-20'>
                            When you load into chess, the first button that is accessible for you to press is 'Avert Game'. This will allow you to cancel your game BEFORE another player joins, by invoking the escrow contract to send your money back. Then you can leave the game! 

                            <div class='mt-2'>If another player joins, each of you will play until the game ends in a draw or checkmate! Once that occurs,
                                click the selected option that is available for you, 'Collect draw', or 'Collect win'. Then, you may leave the game! Happy wagering!
                            </div>
                        </div></div>
                    {:else}
                        <div class=' w-4 h-4 absolute tooltip m z-20' ><img src='/img/info.svg' alt='Info box. click'><div class='border border-blue-500 max-h-fit w-52 p-5 rounded-lg bg-[#EFECE6] text-xs text-center tooltipinfo z-20'>
                            When you load into chess, the first button that is accessible for you to press is 'Avert Game'. This will allow you to cancel your game BEFORE another player joins, by invoking the escrow contract to send your money back. Then you can leave the game by pressing 'Leave Game'! 

                            <div class='mt-2'>If another player joins, each of you will play until the game ends in a draw or checkmate! Once that occurs,
                                click the selected option that is available for you, 'Collect draw', or 'Collect win'. Then, you may leave the game by pressing 'Leave Game'. Happy wagering!
                            </div>
                        </div></div>
                    {/if}
                </div>
                <div class='mx-4 px-2 py-4 border-b dark:border-blue-800 border-indigo-800'>Players: {host ? `${host}` : ''} {player2 ? `, ${player2}` : ``}</div>
                <div class='mx-4 px-2 py-4 border-b dark:border-blue-800 border-indigo-800'>
                    {#if winner}
                        <div class={$connectedUsername != winner ? 'animate-pulse' : ''}>{winner} won by checkmate!</div>
                    {:else if Stalemate || isDraw}
                        The game is a stalemate! (draw)
                    {:else if isDraw && !Stalemate}
                        The game is a draw!
                    {:else}
                    <div class={$connectedUsername == currentTurn ? 'animate-pulse' : ''}>Current Turn: {currentTurn && currentRoom ? currentTurn : 'Awaiting players...'} {$connectedUsername === currentTurn ? '(Your turn)' : ''}</div>
                    {/if}
                </div>
                <div class='mx-4 px-2 py-4 border-b mb-8 dark:border-blue-800 border-indigo-800'>
                    {currentRoom && player2 ? 'Total Stake' : 'Stake'}: {currentRoom && !player2 ? `${currentRoom.stake} TRX`: currentRoom && player2 ? `${currentRoom.stake * 2} TRX`: ''} </div>


                <div class='flex justify-center w-full py-4 px-2 flex-col'>
                    <div class='flex flex-row justify-center items-center mb-2'>

                        {#if currentRoom.isCheckmate == $connectedUsername && !hasClicked && !currentRoom.redeemedStake.includes($connectedUsername) && currentRoom.stake != '0'}
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 dark:hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                            transition-200 ml-1'
                            on:click={(e)=>collectWager(currentRoom.index)}>
                            Collect win</button>
                        {:else if currentRoom.isCheckmate != $connectedUsername || hasClicked 
                        || currentRoom.redeemedStake.includes($connectedUsername) || currentRoom.stake == '0'}
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white transition
                            transition-200 opacity-50 mr-1 '
                            disabled>
                            Collect win</button>
                        {/if}
                        {#if isDraw && !hasClicked && !currentRoom.redeemedDraw.includes($connectedUsername) || Stalemate && 
                        !hasClicked && !currentRoom.redeemedDraw.includes($connectedUsername) && currentRoom.stake != '0' }
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                            transition-200 mr-1 '
                            on:click={(e)=>collectDraw(currentRoom.index)}>Collect draw </button>
                        {:else if hasClicked || !isDraw && !Stalemate || currentRoom.redeemedDraw.includes($connectedUsername)}
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] mr-1 dark:text-white opacity-50'
                            disabled>Collect draw</button>
                        {/if}
                    </div>
                    <div class='flex flex-row justify-center w-full'>
                        {#if currentRoom.players.length < 2 && currentRoom.stake == '0' || currentRoom.isCheckmate != $connectedUsername && currentRoom.isCheckmate || 
                        currentRoom.redeemedStake.includes($connectedUsername) && currentRoom.redeemedStake || currentRoom.redeemedDraw.includes($connectedUsername) && currentRoom.redeemedDraw || currentRoom.isCheckmate && currentRoom.stake == '0' || currentRoom.isDraw && currentRoom.stake == '0' || currentRoom.isStalemate && currentRoom.stake == '0' }
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                            transition-200 mr-1' on:click={leaveGame}>
                            Leave Game
                        </button>
                        {:else}
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white transition
                            transition-200 opacity-50 mr-1' disabled>
                            Leave Game
                            </button>
                        {/if}
                        {#if currentRoom.players.length < 2 && !hasClicked && !currentRoom.redeemedDraw.length && !currentRoom.redeemedStake.length && currentRoom.stake != '0'}
                            <button class=' rounded-[10px] border border-zinc-500 hover:border-green-500 
                            py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                            transition-200 '
                            on:click={(e)=>avertGame(currentRoom.index) }>
                            Avert Game
                            </button>
                        {:else}
                            <button class='rounded-[10px] border border-zinc-500 hover:border-green-500 
                            py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white transition
                            transition-200  opacity-50' disabled>
                            Avert Game
                            </button>
                        {/if}
                    </div>
            </div>
            </div>
        {:else if !currentRoom}
            <div class='border rounded-lg dark:border-blue-500 border-indigo-500 h-fit 
            w-[24rem] font-semibold dark:border-opacity-30 border-opacity-50'>
                <div class='mx-4 px-2 py-4 dark:border-blue-800 border-b border-indigo-800 dark:opacity-30 opacity-50'>Please wait...</div>
                {#if isNotGame}
                    <div class='mx-4 px-2 py-4 dark:border-blue-800 border-b border-indigo-800 dark:opacity-60 opacity-70'><button on:click={redirectJoin} class='hover:scale-[1.07] transition transition-200 hover:underline animate-pulse hover:text-blue-400 mr-2.5 opacity-100'>Click here to create/join a game</button></div>
                {:else}
                    <div class='mx-4 px-2 py-4 dark:border-blue-800 border-b border-indigo-800 dark:opacity-60 opacity-70 animate-pulse'>Please wait...</div>
                {/if}
                <div class='mx-4 px-2 py-4 dark:border-blue-800 border-b border-indigo-800 mb-8 dark:opacity-30 opacity-50'>Stake: {currentRoom ? `${currentRoom.stake} TRX`: currentRoom && player2 ? `${parseInt(currentRoom.stake) * 2} TRX`: ''} </div>
                
            </div>
        {/if}
        <div class=''>
            
            {#if $theme == 'dark' && currentRoom && currentRoom.players.length > 1}
                <div
                    use:Chessground={{ config, initializer: init }}
                    class="blue transition transition-200"
                    use:cgStylesHelper={{
                        piecesFolderUrl: '/chess/images/pieces/merida',
                        boardUrl: '/chess/images/board/purple.svg'
        
                    }}
                    style="height: 540px; width: 540px;" 
                />
            {:else if $theme == 'dark' && !currentRoom || $theme == 'dark' && currentRoom.players.length < 2}
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
            {#if $theme == 'light' && currentRoom && currentRoom.players.length > 1}
                <div
                use:Chessground={{ config, initializer: init }}
                class="blue transition transition-200"
                use:cgStylesHelper={{
                    piecesFolderUrl: '/chess/images/pieces/merida',
                    boardUrl: '/chess/images/board/blue.svg'
    
                }}
                style="height: 540px; width: 540px;" 
                />
            {:else if $theme == 'light' && !currentRoom || $theme == 'light' && currentRoom.players.length < 2}
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
        <div class=''>
            <Chat></Chat>
        </div>
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

<style>
.tooltip .tooltipinfo {
    visibility: hidden;
    padding: 5px 0;
}

.tooltip:hover .tooltipinfo {
    visibility: visible;
}
</style>