<script>
	//@ts-nocheck
	import { onDestroy } from 'svelte'
	import { connectedAddress, connectedUsername, urlEndedRooms, urlRooms } from '$lib/state/state'


	let endedRooms
	let rooms
	let hasRoom
	let selectedRoom
	let isPlayer

	let throwErr
	let hasClicked


	onDestroy(() => clearInterval(updateInterval))

	const games = [
		{
			game: 'Chess',
			players: 'nicky.trx',
			stake: '10000 TRX'
		},
		{
			game: '8 Ball',
			players: 'bobby.trx, npm.trx.. ',
			stake: '1500'
		},
		{
			game: 'Drawades',
			players: 'jimmy.trx, abcd.trx, (2 more)',
			stake: '100 TRX'
		}
	];

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
			console.log(rooms)
			room = endedRooms?.find(room => room.players.includes($connectedUsername))
			if (room) {
				hasRoom = room
				isPlayer = true
			}
		}
	} getEndedRoom()



	let isExpanded = false
	
	async function joinGameExpanded(room) {
		if (room.game == 'chess' || room.game == 'Chess') {
			try {
				selectedRoom = room
				isExpanded = !isExpanded
				getPlayerBalance = await window.tronWeb.trx.getBalance($connectedAddress) / 1000000
				if (room.stake > getPlayerBalance) throwErr = `Insufficient balance to join game - requires a stake of ${room.stake} ${room.token}`
			} catch (error) {
				hasClicked = false
			}
		}
	}

	async function joinGame(room) {

	}

</script>

<section id="games">
	<div class="mx-auto max-w-7xl px-4 py-20 md:px-6 ">
		
		<div class="flex flex-col items-center gap-8">
			<h2 class="text-3xl font-medium md:text-4xl">Game Lobbies</h2>
			<button class='flex absolute text-bold mt-10 hover:scale-[1:05] transition transition-200 opacity-50' disabled>Create a game here</button>
		</div>
		<div class="relative mt-12 divide-y divide-gray-200 rounded-[10px] border border-blue-400 border-opacity-100 px-6 md:px-10 opacity-100">
			<!-- <div class='absolute font-bold z-20 opacity-100 text-[#4957B0] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
			mx-auto text-5xl hover:scale-[1.02] transition transition-200'
			>Coming soon</div> -->
			
			<!-- Game Lobby -->
			{#if rooms}
				{#each rooms as room, index}
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
						{#if isPlayer || !$connectedAddress || !$connectedUsername}
							<button class="whitespace-nowrap rounded-[10px]  bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 text-lg font-medium text-white opacity-50"
							disabled>Join Game</button>
						{:else}
							<button on:click={(e)=>joinGameExpanded(room)} class="whitespace-nowrap rounded-[10px] hover:scale-[1.075] transition transition-200 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 text-lg font-medium text-white"
							>Join Game</button>
						{/if}
					</div>
				{/each}
				{#if selectedRoom}
				<div id="container" class:show={isExpanded}>
					<div id="exampleModal" class="reveal-modal flex flex-col bg-white justify-between w-1/2 font-serif dark:text-white dark:bg-zinc-600">
						{#if throwErr}
							<div class='error'>{throwErr}</div>
						{/if}
						<h2 class='title text-3xl flex justify-center'>Join Game {selectedRoom.gameID}</h2>
						<div class='flex justify-center text-center'>
							<p class='warning text-lg mt-5 w-1/2 flex items-center'>
							Are you sure you want to join this game? You need to stake 
								{selectedRoom.stake} {selectedRoom.token} to play this game.</p>
						</div>
							
						
						<!-- svelte-ignore a11y-invalid-attribute -->
						<div class="">
							<div class='between flex justify-between flex-end '>
								

									{#if !hasClicked}
									<button class="close-reveal-modal group  ml-2 py-4 px-8 border border-transparent 
									text-2xl font-medium rounded-md text-white bg-red-500 hover:bg-red-600 
									hover:scale-[1.04] transition transition-200 dark:bg-red-500 
									dark:hover:bg-red-600 focus:outline-none focus:ring-red-400" on:click={(e)=>joinGameExpanded(selectedRoom)}>Cancel</button>
										<button on:click={(e)=>joinGame(selectedRoom)} class='group relative ml-2 py-4 px-8 border border-transparent 
											text-2xl font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 
											hover:scale-[1.04] transition transition-200 dark:bg-indigo-500 
											dark:hover:bg-indigo-600 focus:outline-none focus:ring-indigo-400'> 
											Join Game
										</button>
									{:else if hasClicked}
										<button class="close-reveal-modal group  ml-2 py-4 px-8 border border-transparent 
											text-2xl font-medium rounded-md text-white bg-red-600
											focus:outline-none opacity-50 " on:click={(e)=>joinGameExpanded(selectedRoom)} disabled>Cancel</button>
										<button on:click={(e)=>joinGame(selectedRoom)} class='group relative ml-2 py-4 px-8 border border-transparent 
											text-2xl font-medium rounded-md text-white bg-sky-600
											transition transition-200 dark:bg-indigo-500 opacity-50
											focus:outline-none focus:ring-indigo-400' disabled> 
											Join Game
										</button>
									{/if}
							</div>
						</div>
					</div>
				</div>
				{/if}
			{/if}

			
		</div>
		
	</div>
</section>
