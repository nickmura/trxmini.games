<script>
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
</script>

<section id="games">
	<div class="mx-auto max-w-7xl px-4 py-20 md:px-6 ">
		
		<div class="flex flex-col items-center gap-8">
			<h2 class="text-3xl font-medium md:text-4xl">Game Lobbies</h2>
			<button class='flex absolute text-bold mt-10 hover:scale-[1:05] transition transition-200 opacity-50' disabled>Create a game here</button>
		</div>
		<div class="relative mt-12 divide-y divide-gray-200 rounded-[10px] border border-blue-400 border-opacity-40 px-6 md:px-10 opacity-100">
			<div class='absolute font-bold z-20 opacity-100 text-[#4957B0] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
			mx-auto text-5xl hover:scale-[1.02] transition transition-200'
			>Coming soon</div>
			
			<!-- Game Lobby -->
			{#each games as game, index}
				<div class="grid gap-6 py-12 md:flex md:items-center md:justify-between md:py-16 opacity-40">
					<div class="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
						<div class="relative self-start">
							<span
								class="absolute -top-2 -right-2 block h-8 w-8 rounded-full bg-gradient-to-r from-blue-500/90 to-blue-600/50"
							/>
							<span class="relative text-5xl font-medium md:text-6xl">0{index + 1}</span>
						</div>
						<div>
							<div class="text-2xl font-semibold">Game</div>
							<span class="text-xl font-light text-gray-600">{game.game}</span>
						</div>
					</div>

					<!-- Separator -->
					<div class="hidden h-16 w-px bg-gray-200 md:block" />

					<div>
						<div class="text-2xl font-semibold">Players</div>
						<span class="text-xl font-light text-gray-600">
							{game.players}
						</span>
					</div>

					<!-- Separator -->
					<div class="hidden h-16 w-px bg-gray-200 md:block" />

					<div>
						<div class="text-2xl font-semibold">Stake</div>
						<span class="text-xl font-light text-gray-600">{game.stake}</span>
					</div>

					<button
						class="whitespace-nowrap rounded-[10px] bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2 text-lg font-medium text-white"
					>
						Join Game
					</button>
				</div>
			{/each}
			
		</div>
		
	</div>
</section>
