<script>
	//@ts-nocheck
	import { onDestroy } from 'svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { chessContract, connectedAddress, connectedUsername, createGameForm, urlEndedRooms, urlRooms, chessWs, connectedChain, inGame } from '$lib/state/state'
	
	import { io } from 'socket.io-client'
	import CreateGame from '$lib/components/_ui/create/CreateGame.svelte'
	const socket = io(chessWs)


	let endedRooms
	let rooms
	let hasRoom
	let selectedRoom
	let isPlayer
	let getPlayerBalance
	let throwErr
	let hasClicked


	onDestroy(() => clearInterval(updateInterval))



	async function updateRooms() {
        let room 
		const res = await fetch(urlRooms)
		if (!res.ok) throw new Error(res)

		let json = await res.json()
		rooms = JSON.parse(json)
        if (rooms != null && rooms.length && rooms != undefined) {
			//console.log(rooms)
			room = rooms?.find(room => room.players.includes($connectedUsername))
			if (room) {
				hasRoom = room
				isPlayer = true
			}
		}
    } const updateInterval = setInterval(updateRooms, 1000)

	async function getEndedRoom() {
		let room
		const res = await fetch(urlEndedRooms)
		if (!res.ok) throw new Error(res)
		endedRooms = JSON.parse(await res.json())
        if (endedRooms != null && endedRooms.length && endedRooms != undefined) {
			
			room = endedRooms?.find(room => room.players.includes($connectedUsername))
			console.log($connectedUsername, room)
			if (room) {
				hasRoom = room
				inGame.set(true)
				isPlayer = true
			}
		}
	} setTimeout(() => {
		getEndedRoom()
	}, 1200)



	let isExpanded = false
	

	let letTimeout = false

	setTimeout(() => {
		letTimeout = true
	}, 1600)
	async function joinGameExpanded(room) {
		if (room.game == 'chess' || room.game == 'Chess') {
			try {
				selectedRoom = room
				isExpanded = !isExpanded
				getPlayerBalance = await window.tronWeb.trx.getBalance($connectedAddress) / 1000000
				if (selectedRoom.stake > getPlayerBalance) throwErr = `Insufficient balance to join game - requires a stake of ${selectedRoom.stake} ${room.token}`
				else throwErr = ''
			} catch (error) {
				hasClicked = false
			}
		}
	}

	async function joinGame(room) {
		let stake
		let i 
		try {
			if (room.stake != '0') {
			throwErr = ''
			hasClicked = true
			stake = room.stake*1000000
			//console.log(typeof(stake), stake)
			i = parseInt(room.index)
			console.log(stake, i)
			let parameter = [{type:'uint256',value:i},{type:'address', value:$connectedAddress}, {type:'uint256', value:stake}]
			let options = {
				feeLimit:100000000,
				callValue:stake
			}
			// Invoke contract function joinGame() with parameters above
			const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(window.tronWeb.address.toHex(chessContract), 
			"joinGame(uint256,address,uint256)", options, parameter, window.tronWeb.address.toHex($connectedAddress))
			const signedTx = await tronWeb.trx.sign(tx.transaction);
			const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx);
			}
			socket.emit('joinRoom', $connectedUsername, room.gameID)
			if ($page.routeId == '/join') goto('../chess')
			else goto('./chess')
		} catch (error) {
			console.log(error)
			hasClicked = false
		}
	}

</script>

<section id="games">
	<div class="mx-auto max-w-7xl px-4 py-20 md:px-6 ">
		
		<div class="flex flex-col items-center gap-8">
			<h2 class="text-3xl font-medium md:text-4xl">Game Lobbies</h2>
			{#if $connectedUsername && letTimeout}
				{#if $page.routeId == '/'}
					{#if $connectedChain && !$inGame}
						<button class='flex absolute text-bold mt-10 hover:scale-[1:05] transition transition-200 opacity-100 hover:scale-105 animate-pulse' on:click={createGameForm}><a href='/#'>Create a game here!</a></button>
					{:else if $inGame}
					<button class='flex absolute text-bold mt-10 opacity-100 text-red-300 animate-pulse' disabled>You are currently in a game! Click <a href={$page.routeId == '/' ? '/chess' : $page.routeId == '/join' ? '../chess' : '/chess'}>&nbsp;<u> here to join back/leave.</u></a></button>
					{:else if !$connectedChain}
						<button class='flex absolute text-bold mt-10 opacity-100 text-red-300 animate-pulse' disabled>You are not on the correct chain! Connect to Shasta testnet on TronLink!</button>
					{/if}
				{:else}
					{#if $connectedChain}
						<button class='flex absolute text-bold mt-10 hover:scale-[1:05] transition transition-200 opacity-100 hover:scale-105 animate-pulse ' on:click={createGameForm}>Create a game here!</button>
					{:else if !$connectedChain}
						<button class='flex absolute text-bold mt-10 opacity-100 text-red-300  animate-pulse' disabled>You are not on the correct chain! Connect to Shasta testnet on TronLink!</button>
					{/if}
				{/if}
			{:else if !$connectedUsername && $connectedAddress && letTimeout}
			<button class='flex absolute text-bold mt-10 opacity-100 text-red-300  animate-pulse' disabled>You need to create a TRX username before playing! Click  <a href={$page.routeId == '/' ? '/username' : $page.routeId == '/join' ? '../username' : ''}>&nbsp;<u>here to create a domain</u>.</a></button>
			{/if}
		</div>
		<CreateGame></CreateGame>
		{#if rooms}
		<div class="relative mt-12 divide-bottom divide-gray-200 rounded-[10px] border border-blue-400 border-opacity-100 px-6 md:px-10 opacity-100">
			<!-- <div class='absolute font-bold z-20 opacity-100 text-[#4957B0] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
			mx-auto text-5xl hover:scale-[1.02] transition transition-200'
			>Coming soon</div> -->
			
			<!-- Game Lobby -->
				{#if !rooms.length}
					<div class='flex justify-center w-full py-6 font-semibold text-2xl'>No games available!</div>
				{/if}
				{#each rooms as room, index}
				{#if room.players.length > 1}
						<div class="grid gap-6 py-12 md:flex md:items-center md:justify-between md:py-16 opacity-100">
							<div class="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
								<div class="relative self-start">
									<span
										class="absolute -top-2 -right-2 block h-8 w-8 rounded-full bg-gradient-to-r from-blue-500/90 to-blue-600/50"
									/>
									<span class="relative text-5xl font-medium md:text-6xl">0{index+1}</span>
								</div>
								<div>
									<div class="text-2xl text-gray-600 font-semibold">Game</div>
									<span class="text-xl font-light text-gray-600">{room.game}</span>
								</div>
							</div>

							<!-- Separator -->
							<div class="hidden h-16 w-px bg-gray-500 md:block" />

							<div>
								<div class="text-2xl text-gray-600 font-semibold">Players</div>
								<span class="text-xl font-light text-gray-600">
									{room.players}
								</span>
							</div>

							<!-- Separator -->
							<div class="hidden h-16 w-px bg-gray-600 md:block" />

							<div>
								<div class="text-2xl text-gray-600 font-semibold">Stake</div>
								<span class="text-xl font-light text-gray-600">{room.stake} TRX</span>
							</div>
							{#if isPlayer || !$connectedAddress || !$connectedUsername || !$connectedChain}
								<button class="whitespace-nowrap rounded-[10px]  bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 text-lg font-medium text-white opacity-50"
								>Join Game</button>
							{:else}
								<button class="opacity-50 whitespace-nowrap rounded-[10px] z-50 transition transition-200 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 text-lg font-medium text-white"
								disabled>Join Game</button>

							{/if}
						</div>
					{/if}
					{#if room.players.length < 2}
						<div class="grid gap-6 py-12 md:flex md:items-center md:justify-between md:py-16 opacity-100">
							<div class="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
								<div class="relative self-start">
									<span
										class="absolute -top-2 -right-2 block h-8 w-8 rounded-full bg-gradient-to-r from-blue-500/90 to-blue-600/50"
									/>
									<span class="relative text-5xl font-medium md:text-6xl">0{index+1}</span>
								</div>
								<div>
									<div class="text-2xl font-semibold">Game</div>
									<span class="text-xl font-light text-gray-600">{room.game}</span>
								</div>
							</div>

							<!-- Separator -->
							<div class="hidden h-16 w-px bg-gray-200 md:block" />

							<div>
								<div class="text-2xl font-semibold">Players</div>
								<span class="text-xl font-light text-gray-600">
									{room.players}
								</span>
							</div>

							<!-- Separator -->
							<div class="hidden h-16 w-px bg-gray-200 md:block" />

							<div>
								<div class="text-2xl font-semibold">Stake</div>
								<span class="text-xl font-light text-gray-600">{room.stake} TRX</span>
							</div>
							{#if isPlayer || !$connectedAddress || !$connectedUsername || !$connectedChain}
								<button class="whitespace-nowrap rounded-[10px]  bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 text-lg font-medium text-white opacity-50"
								>Join Game</button>
							{:else}
								<button on:click={(e)=>joinGameExpanded(room)} class="whitespace-nowrap rounded-[10px] z-50 hover:scale-[1.075] transition transition-200 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 text-lg font-medium text-white"
								>Join Game</button>
							{/if}
						</div>
					{/if}
				{/each}
				{#if selectedRoom}
				<div id="container" class='flex flex-initial' class:show={isExpanded}>
						
					<div id="exampleModal" class="absolute reveal-modal overflow-hidden bottom-[8rem] border border-[#b3b2b1] text-black opacity-[98] bg-[#ECECEA] dark:bg-[#111112] dark:text-white 
					shadow-xL rounded-lg p-6">
				
						<h2 class='title font-semibold'>Join {selectedRoom.host}'s game</h2>

						<div class=''>
							<div class='flex justify-center h-[16rem] mt-3 '>
								<div class='border border-[#b3b2b1] dark:border-zinc-700 
								rounded-lg w-full'>
								<div class='mr-2 text-[10px] text-[#b6bab7] flex justify-end'><i>Balance: {Math.round(100*getPlayerBalance)/100} TRX</i></div>
									<div class='flex justify-center text-center text-red-300'>
										{#if throwErr}
											{throwErr}
										{/if}
									</div>
									<div class='flex wrap py-12 px-8 flex justify-center mx-2 ml-2 border-[#535754]'>
										<div class='font-semibold mt-1.5 text-center'>Are you sure you want to join this game? The required
											stake is {selectedRoom.stake} TRX.	
										</div>


										</div>

									
									
								</div>  
								
							</div>
						</div>

						<div class='absolute inset-x-0 bottom-0 mb-4 ml-4 mr-[1.5rem]'>
							<div class='flex justify-between'>
								<button class="ml-2 rounded-[10px] border border-indigo-500 dark:border-red-500 
								py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
								transition-200" on:click={(e)=>joinGameExpanded(selectedRoom)}>Cancel</button>
				
								<!-- Change last and operator to selectedRoom.stake > 49 -->
								{#if selectedRoom.stake && selectedRoom.stake < getPlayerBalance - 16 && !hasClicked && selectedRoom.stake > 9 || selectedRoom.stake == '0'}  
									<button on:click={(e)=>joinGame(selectedRoom)} class=' rounded-[10px] border 
										border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500 py-1.5 px-6 text-lg 
										font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
										transition-200'> 
										Join Game
									</button>
								
								{:else if hasClicked}
									<button on:click={(e)=>joinGame(selectedRoom)} class=' rounded-[10px] 
										border border-emerald-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] 
										dark:text-white scale-[1.05] opacity-80
										' disabled> 
										Join Game
									</button>
								{:else if selectedRoom.stake > getPlayerBalance || selectedRoom.stake > getPlayerBalance - 16 || selectedRoom.stake < 50}
									<button on:click={(e)=>joinGame(selectedRoom)} class=' rounded-[10px] border border-[#b3b2b1] 
										py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white opacity-50' disabled> 
										Join Game
									</button>
								{/if}
							</div>
							
						</div>
					</div>
				</div>
				{/if}
			</div>
		{/if}
	</div>
</section>


<style>
	#container {
		width: 100%;

		position: absolute;
		top: 0;
		left: 0;
		visibility:hidden;
		display:none;
	}
	
	#container.show {
		z-index: 20;
		visibility: visible;
		display: block;
	}
	
	.reveal-modal {
		margin: 0 auto;
		width:320px; 
		height: 400px;
		position:relative;
		
		z-index:100;
		;
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
</style>