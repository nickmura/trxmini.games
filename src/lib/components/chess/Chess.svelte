<script lang='ts'>

    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { slide } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { io } from 'socket.io-client';

    import type { Api, Config, CgActionParams } from './app/index';
    import type { Rooms } from '$lib/state/state';
    import type { Square } from 'chess.js';

    import { chessWs, urlRooms, urlEndedRooms, tipSocket } from '$lib/state/state'; // ENDPOINTS
    const socket = io(chessWs)
    const notificationSocket = io(tipSocket)

    import { 
        connectedAddress,
        connectedUsername,
        userID,
        chessContract,
        currentState,
        inGame,
        creatingGame,
        wagerTx,
        theRoom
    } from '$lib/state/state';



    import Chat from './Chat.svelte'

    // @ts-ignore
    import { Chess } from 'chess.js'; 
    import { turnColor, validMovesAsDests } from './app/_utils';
    import { Chessground, cgStylesHelper } from "./app/index"
    import './app/cgstyles/chessground.css';
	import { theme } from '$lib/state/Theme.svelte'
    import type cg from 'chessground/types';
	import type { MoveMetadata } from 'chessground/types';


    let isHostAddress = false
    let isTwoAddress = false

    let rooms:Rooms[] | undefined
    let currentRoom:Rooms 
    let invalidRoom:boolean

    let isCheckmate
    let isDraw:boolean  
    let Stalemate:boolean

    let fullGame = false
    let gameEnded = false
    let hasClicked = false
    let receivedStake = false

    let winner:string
    let currentTurn:string
    let currentTurnPlayer:string
    let host:string
    let player2:string
    let color:"white" | "black" | undefined
    let roomStake:string




    async function updateRooms() {
        console.log($userID)
        let room
		const res = await fetch(urlRooms)
		if (!res.ok) return res.text().then(text => { throw new Error(text) })
		rooms = JSON.parse(await res.json())

        
        
        if ($userID) { //This is not runing because $userID isn't before this component via Authenticate.svelte
            if (rooms != null) room = rooms?.find(room => room.players.includes($userID))
            console.log(room)
            let counter = 0
            while (!room && counter < 300) {
                counter++;
                const res = await fetch(urlRooms)
                if (!res.ok) throw new Error (`${res.status}: ${res.statusText}`)
		        rooms = JSON.parse(await res.json())
                room = rooms?.find(room => room.players.includes($userID))
                if (room) invalidRoom = false;
                if (!room) invalidRoom = true;
            }
                if (room) {
                    
                    inGame.set(true)
                    socket.emit('reconnectPlayer', room)
                    currentRoom = room
                    if (currentRoom) roomStake = currentRoom.stake
                        if (room.wagerTxs?.find(wager => wager.user == $userID)) {
                            let tx = room.wagerTxs?.find(wager => wager.user == $userID)
                            if (tx) wagerTx.set(tx.txid)
                            console.log('WagerTxid', $wagerTx)
                        }
                    
                    
                }
                if (room) host = room.host
                //@ts-ignore
                if (window.tronWeb.isAddress(host)) {
                    isHostAddress = true
                }
                

            }
        

        if (room && room.players.length > 1) {
            socket.emit('reconnectPlayer', room) //No reason to grab state before game starts.
            currentRoom = room
            if (currentRoom) roomStake = currentRoom.stake
            player2 = room.player2
            fullGame = true
            currentTurn = room.currentTurn
            currentState.set(room.fen)
            if (player2 == $userID){
                color = 'black'
            } else if (host == $userID) {
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
            //@ts-ignore
            if (window.tronWeb.isAddress(player2)) {
                isTwoAddress = true
            }
            console.log(color)
        } 

    } 

    async function getEndedRoom() { // Checks if currentRoom has already ended (host or someone left, etc)
       let room
       const res = await fetch(urlEndedRooms)
       if (!res.ok) return res.text().then(text => { throw new Error(text) })
       rooms = JSON.parse(await res.json())

        //@ts-ignore
        if (rooms?.find(room => room.players.includes($userID))) {
            room = rooms?.find(room => room.players.includes($userID))
            if (room) currentRoom = room
            if (currentRoom.host) host = currentRoom.host
            if (currentRoom.player2) player2 = currentRoom.player2
            if (currentRoom) roomStake = currentRoom.stake
            currentState.set(currentRoom.fen)
            fullGame = true
            gameEnded = true
            console.log(currentRoom)
            inGame.set(true)
            console.log(currentRoom.wagerTxs)
            if (currentRoom.wagerTxs?.find(wager => wager.player == $userID)) {
                let tx = currentRoom.wagerTxs.find(wager => wager.player == $userID)
                if (tx) wagerTx.set(tx.txid)
                console.log($wagerTx)
            } 
            if (host == $userID) {
                color = 'white'
            } else if (player2 == $userID) {

                color = 'black'
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
            console.log(color)
        }
       
    } 


    onMount(() => {
        setTimeout(updateRooms, 1200)
        setTimeout(getEndedRoom, 1200)
    })


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
    let cgApi:Api

    const playOtherSide = (orig: cg.Key | Square, dest: cg.Key | Square, metadata: cg.MoveMetadata | undefined) => {
        console.log(orig, dest)
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

        socket.emit('chessMove', $userID, chess.fen())  /** Emits that a client has made a move to the other room */
        currentTurnPlayer = currentTurn === 'white' ? player2 : host;
        if (isCheckmate) {
            socket.emit('isCheckmate', currentTurnPlayer)
        } if (Stalemate && isDraw) {
            socket.emit('isStalemate', $userID)
        } if (isDraw && !Stalemate && !isCheckmate) {
            socket.emit('isDraw', $userID)
        }
    }

    socket.on('emitMove', (FEN, turn) => {

        console.log('emitMove',FEN, turn)
        currentState.set(FEN)
        currentTurnPlayer = turn
    })

    // currentState is undefined until player joins game, which is assigned FEN value when player joins
    socket.on('playerJoined', (FEN) => {
        console.log('playerJoined')
        currentState.set(FEN)
        updateRooms()
    })
    socket.on('gameForfeited', () => {
        currentState.set('')
    })

    let config:Config
    $: config = {
        fen: $currentState,
        orientation:color,
        // dests: validMovesAsDests(chess),
        movable: {
            //color: 'both',
            free: false,
            dests: validMovesAsDests(chess),
            events: {after:playOtherSide}
        },
    };

    
 


    function init(api:Api) {
        api.state.movable.dests = validMovesAsDests(chess);
        // @ts-ignore
        console.log($currentState)
        updateRooms()
        cgApi = api;
        cgApi.set({
            fen:$currentState,
            lastMove:[], // clear lastMove array to avoid issues related to turn
            // dests:validMovesAsDests(chess),
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
            socket.emit('deleteRoom', $userID)
            sessionStorage.removeItem('inGame')
            wagerTx.set('')
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

    async function collectWager(index:string) {
        try {
            hasClicked = true
            let opponent
            //let index = parseInt(index)
            var parameter = [{type:'uint',value:parseInt(index)}]
            var options = {
                feeLimit: 100000000,

            }
            if ($userID == host) opponent = player2
            if ($userID == player2) opponent = host
            // invoking contract function
            //@ts-ignore
            const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                //@ts-ignore
                window.tronWeb.address.toHex(chessContract), "payWager(uint256)",
                //@ts-ignore
                options, parameter, window.tronWeb.address.toHex($connectedAddress))
            //@ts-ignore
            const signedTx = await tronWeb.trx.sign(tx.transaction);
            //@ts-ignore
            const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx); 
            wagerTx.set(broadcastTx.txid)
            socket.emit('redeemedStake', $userID, broadcastTx.txid);
            notificationSocket.emit('wonChessWager', $userID, opponent, broadcastTx.txid, currentRoom.stake)
            receivedStake = true
            


        } catch (error) {
            hasClicked = false
        }
    }



    async function collectDraw(index:string) {
        try {
            hasClicked = true
            //let index = parseInt(index)
            var parameter = [{type:'uint',value:parseInt(index)}]
            var options = {
                feeLimit: 100000000,

            }

            // invoking contract function
            //@ts-ignore
            const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                //@ts-ignore
                window.tronWeb.address.toHex(chessContract), "payDraw(uint256)",
                //@ts-ignore
                options, parameter, window.tronWeb.address.toHex($connectedAddress))
            //@ts-ignore
            const signedTx = await tronWeb.trx.sign(tx.transaction);
            //@ts-ignore
            const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx); 

            wagerTx.set(broadcastTx.txid)
            
            socket.emit('redeemedDraw', $userID, broadcastTx.txid)
            receivedStake = true
        } catch (error) {
            hasClicked = false
        }
    }

    async function avertGame(index:string) {
        try {
            hasClicked = true
            //let index = parseInt(index)
            var parameter = [{type:'uint',value:index}]
            var options = {
                feeLimit: 100000000,

            }

            // invoking contract function
            //@ts-ignore
            const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                //@ts-ignore    
                window.tronWeb.address.toHex(chessContract), "forfeit(uint256)",
                //@ts-ignore
                options, parameter, window.tronWeb.address.toHex($connectedAddress))
            //@ts-ignore
            const signedTx = await tronWeb.trx.sign(tx.transaction);
            //@ts-ignore
            const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx); 
            console.log(broadcastTx)
            wagerTx.set(broadcastTx.txid);
            
            socket.emit('avertGame', $userID, broadcastTx.txid)
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
                <div class='mx-4 px-2 py-4 border-b dark:border-blue-800 border-indigo-800'>Players: {host && isHostAddress ? `${host.substring(0,5)}...${host.substring(29,34)}` : host && !isHostAddress ? `${host}` :''} {player2 && isTwoAddress ? `, ${player2.substring(0,5)}...${player2.substring(29,34)}` : player2 && !isTwoAddress ? `${player2}` : ``}</div>
                <div class='mx-4 px-2 py-4 border-b dark:border-blue-800 border-indigo-800'>
                    {#if winner}
                        <div class={$userID == winner ? 'animate-pulse' : ''}>{winner} won by checkmate!</div>
                    {:else if Stalemate || isDraw}
                        The game is a stalemate! (draw)
                    {:else if isDraw && !Stalemate}
                        The game is a draw!
                    {:else}
                    <div class={$userID == currentTurn ? 'animate-pulse' : ''}>Current Turn: {currentTurn && currentRoom ? currentTurn : 'Awaiting players...'} {$userID === currentTurn ? '(Your turn)' : ''}</div>
                    {/if}
                </div>
                <div class='mx-4 px-2 py-4 border-b mb-8 dark:border-blue-800 border-indigo-800'>
                    {currentRoom && player2 ? 'Total Stake' : 'Stake'}: {currentRoom && !player2 ? `${currentRoom.stake} TRX`: currentRoom && player2 ? `${parseInt(currentRoom.stake) * 2} TRX`: ''} </div>


                <div class='flex justify-center w-full py-4 px-2 flex-col'>
                    <div class='flex flex-row justify-center items-center mb-2'>

                        {#if currentRoom.isCheckmate == $userID && !hasClicked && !currentRoom.redeemedStake.includes($userID) && currentRoom.stake != '0'}
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 dark:hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                            transition-200 ml-1'
                            on:click={(e)=>collectWager(currentRoom.index)}>
                            Collect win</button>
                        {:else if currentRoom.isCheckmate != $userID || hasClicked 
                        || currentRoom.redeemedStake.includes($userID) || currentRoom.stake == '0'}
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white transition
                            transition-200 opacity-50 mr-1 '
                            disabled>
                            Collect win</button>
                        {/if}
                        {#if isDraw && !hasClicked && !currentRoom.redeemedDraw.includes($userID) || Stalemate && 
                        !hasClicked && !currentRoom.redeemedDraw.includes($userID) && currentRoom.stake != '0' }
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                            transition-200 mr-1 '
                            on:click={(e)=>collectDraw(currentRoom.index)}>Collect draw </button>
                        {:else if hasClicked || !isDraw && !Stalemate || currentRoom.redeemedDraw.includes($userID) || currentRoom.stake == '0' && currentRoom.idle && currentRoom.isDraw}
                            <button class='rounded-[10px] border border-indigo-500 dark:border-blue-500 
                            border-indigo-500 hover:border-green-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] mr-1 dark:text-white opacity-50'
                            disabled>Collect draw</button>
                        {/if}
                    </div>
                    <div class='flex flex-row justify-center w-full'>
                        {#if currentRoom.isCheckmate != $userID && currentRoom.isCheckmate || 
                        currentRoom.redeemedStake.includes($userID) && currentRoom.redeemedStake || 
                        currentRoom.redeemedDraw.includes($userID) && currentRoom.redeemedDraw || 
                        receivedStake || currentRoom.players.length < 2 && currentRoom.stake == '0' || currentRoom.stake == '0' && 
                        currentRoom.isCheckmate || currentRoom.stake == '0' && currentRoom.isStalemate || currentRoom.stake == '0' && currentRoom.isDraw}
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
                <div class='mx-4 px-2 py-4 dark:border-blue-800 border-b border-indigo-800 mb-8 dark:opacity-30 opacity-50'>Stake: {currentRoom ? `${roomStake} TRX`: currentRoom && player2 ? `${parseInt(roomStake) * 2} TRX`: ''} </div>
                
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
    .tooltip .tooltipinfo {
        visibility: hidden;
        padding: 5px 0;
    }

    .tooltip:hover .tooltipinfo {
        visibility: visible;
    }
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
