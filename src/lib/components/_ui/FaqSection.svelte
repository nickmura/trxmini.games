<script>
	const faqs = [

		{
			question: 'How do you play a minigame?',
			answer:
				`Users can create or join a game via the Game Lobbies section of
				the site. If a stake is required, you will need to sign a digital
				signature via Tronlink or BTTC (soon) to wager your funds.`
		},
		{
			question: 'Is a stake required?',
			answer:
				`No! Our games and services are free unless you want to stake your tokens
				against your friends/opponents. In the future, there will be many different
				features, to personalize yourself on our platform without spending funds.`
		},
		{
			question: 'What is the reason of this project?',
			answer:
				`This project was conceived at the end of September 2022 when attempting to find wagering services for
				a chess game. Providing a personalized escrow service to stake and wager against players on your favorite games
				has been limited to specific intermedaries. TRON is has an excellent catalog of GameFi projects
				and history of supporting GameFi projects, we hope the TRON community and ecosystem
				will find our project important to take interest in supporting back!`
		},
		{
			question: 'Is there a token?',
			answer:
				`No date on token release has been announced. It is TBA when a token will
				be deployed on TRON, and we are keeping track of those who have participated and contributed in the beta. Our goal currently
				is to rollout new features and software for our players as best as possible.  We believe
				our project has signficant intrinsic value without a token. our token will be announced
				and created for governance of the future direction of the project.`
		},
		{
			question: 'When can we expect new games?',
			answer:
				`We are constantly developing new features and implementations for our platform. After the judging period,
				we intend to roll out all the successful changes we've made in the month. We are expecting new games to be rolled out in January.`,
		},
		{
			question: 'How can I provide feedback or participate in the community?',
			answer:
				`More info on our TronDAO forum post can be found <a target='_blank' href='https://forum.trondao.org/t/trxmini-games-a-staked-multiplayer-arcade-games-platform/10155/8'><button class='hover:scale-[1.02] transition transition-200 hover:text-3EA2FF'><span class="text-blue-300"><u> here</u></span></button></a>.
				We intend to create a discord community and various features for incentivizing players to provide feedback/suggestions, such as a governance system.`
				
				},

	];
</script>

<section id="faq" class="bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-500 text-white">
	<div class="mx-auto max-w-7xl px-6">
		<div class="border-t border-gray-200 py-20">
			<h2 class="text-lg font-medium">FAQ</h2>
			<div class="grid grid-cols-1 gap-12 pt-16 md:grid-cols-2">
				{#each faqs as item}
					<div class="max-w-lg">
						<h3 class="text-2xl font-medium">{item.question}</h3>
						<div class="relative">
							<div class="absolute left-0 top-2 h-12 border-l border-dashed border-white" />
							<p class="mt-2 pl-4 text-lg font-light leading-relaxed">
								{@html item.answer}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
