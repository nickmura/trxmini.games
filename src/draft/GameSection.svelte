<script>
	const games = [
		{
			game: 'Drawades',
			players: 'nicky.trx, npm.trx, TXq9...9H65B.. (2 more)',
			stake: '0 TRX'
		},
		{
			game: 'Drawades',
			players: 'nicky.trx, npm.trx, TXq9...9H65B.. (2 more)',
			stake: '0 TRX'
		},
		{
			game: 'Drawades',
			players: 'nicky.trx, npm.trx, TXq9...9H65B.. (2 more)',
			stake: '0 TRX'
		}
	];
</script>

<section id="games">
	<div class="mx-auto max-w-7xl px-4 py-20 md:px-6">
		<div class="flex flex-col items-center gap-8">
			<h2 class="text-3xl font-medium md:text-4xl">Game Lobbies</h2>
		</div>
		<div class="mt-12 divide-y divide-gray-200 rounded-[10px] border border-blue-400 px-6 md:px-10">
			<!-- Game Lobby -->
			{#each games as game, index}
				<div class="grid gap-6 py-12 md:flex md:items-center md:justify-between md:py-16">
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
