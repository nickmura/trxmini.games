<script>
	const roadmaps = [
		{
			title: 'Release beta & gain feedback',
			description:
				`We will release the beta of our platform by November 13th, and will continue to stay 
				involved with the community and project over the course of the judging period. Your opinion
				is important to us -  We love to hear feedback, suggestions, etc. A governance system
				will be set in place soon as possible for users to vote and discuss new features.`,
			image: '/img/makes-icon-1.webp'
		},
		{
			title: 'Create new real time games & expand',
			description:
				`Onboarding new developers onto the team will be the next step after the beta releases, end of
				Q4 2022. Our output of releasing new features & apps to our platform will increase exponentionally, which not only
				includes creating new real time games, and more involved personalization features to our players. Creating an immersive
				experience for anyone, anywhere is a goal not far away!`,
			image: '/img/makes-icon-2.webp'
		},
		{
			title: 'Create oracle network for existing games',
			description:
				`In Spring 2023, we intend to scale a new oracle network on TRON & launching a desktop
				application, for wagering/staking on various competitive esports, casual, and sandbox games
				such as Fortnite, PUBG, Counter Strike, Garry's Mod, etc. Players will be able to create esports
				like competitions in their favorite games! Our long term goal is to make trxmini.games
				a conventional choice for esports wagering on a large or small scale, and continue to 
				bring in new users to the ecosystem, while still providing a full and great support to
				a catalog of casual games.`,
			image: '/img/makes-icon-3.webp'
		}
	];
</script>

<section
	id="roadmap"
	class="bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-500 text-white"
>
	<div class="mx-auto max-w-7xl px-4 py-20 md:px-6">
		<div class="grid grid-cols-1 gap-12 md:grid-cols-2">
			<div class="flex flex-col gap-8">
				<span class="text-lg font-medium uppercase">OUR ROADMAP</span>
				<h2 class="text-3xl leading-snug md:text-4xl">
					As our community grows, our project will continue to scale and evolve
					new apps & features for players, by players.
				</h2>
				<p class="text-lg font-light leading-relaxed text-blue-200">
					We consistently look to implement and create experiences our players
					love - we hold the community interests at the heart of our project's
					future.
				</p>

				<p class='text-lg font-light leading-relaxed text-blue-200'>
					Our our community deserves to receive the best support and content we can provide. 
					We will push the envelope for what trxmini.games represents, and
					can accomplish for GameFi.
				</p>
			</div>
			<div class="flex flex-col">
				{#each roadmaps as item}
					<div class="group relative flex items-start gap-6 pl-6 md:pl-8">
						<div
							class="absolute left-0 z-10 flex-shrink-0 rounded-full bg-gradient-to-b from-blue-400 to-indigo-600"
						>
							<img src={item.image} alt="" class="h-12 w-12 md:h-16 md:w-16" />
						</div>
						<div class="relative min-h-[260px]  pb-12 pl-10 md:pl-16">
							<div
								class="absolute left-0 top-16 h-[78%] border-l-2 border-dashed border-white group-last:border-none md:top-20 md:h-[64%]"
							/>
							<h3 class="text-2xl font-medium uppercase md:mt-2">{item.title}</h3>
							<p class="mt-4 text-lg font-light leading-relaxed text-blue-200">
								{item.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
