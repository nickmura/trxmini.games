<script lang='ts'>
	

	interface Roadmaps {
		title: string,
		description: string,
		image: string
	}


	const roadmaps:Roadmaps[] = [
		{
			title: 'Release beta & gain feedback',
			description:
				`We released our project on November 13th, and we are constantly working on developing and releasing updates. We are also
				consantly involved with the community -  we love to hear feedback, suggestions, etc. We will continue to optimize our code as much as
				we can, be on the constant alert with bugs, faults, etc. A governance system
				will be set in place soon as possible for users to vote and discuss new features.`,
			image: '/img/makes-icon-1.webp'
		},
		{
			title: 'Create new real time games & expand',
			description:
				`After the judging period ends, an audit & refactor will be in place across all infrastructure, to ensure the integrity & security of
				our protocols is at the best it can be. After we can ensure our protocol is secure, we will release on main-net by end of December or January!  
				Our output of releasing new features & apps to our platform will increase exponentionally, which not onlyincludes creating new real time games, and more involved personalization features to our players, such as a marketplace, and NFTs across various
				platforms. Creating an immersive experience for anyone, with a vibrant community, anywhere is a goal not far away!`,
			image: '/img/makes-icon-2.webp'
		},
		{
			title: 'Create oracle network for existing games',
			description:
				`Soon as we have a catalog of games and vibrant features we will start onboarding to existing casual, competitive and esports
				games such as Fortnite, PUBG, Counter Strike, Garry's Mod, etc. Players will be able to coordinate and create esports
				like competitions/ in their favorite games! Our long term goal is to make trxmini.games
				a conventional choice for esports wagering on a large or small scale, and continue to 
				bring in new users to the ecosystem, while still providing a full and great support to
				a catalog of casual games. This creates an exceptional high value propsition as it will bring in many demographics of users 
				to TRON and its ecosystem.`,
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
					Everyday, we strive to create and implement experiences our players love - we hold the community
					interests at the heart of our projects future.
				</p>

				<p class='text-lg font-light leading-relaxed text-blue-200'>
					Everyone on our platform deserves to receive the best experience they can - we will push the limits to what
					trxmini.games accomplish for the ecosystem. Soon, our platform will reach new heights for onboarding users to our ecosystem.
				</p>

				<div class='text-lg font-light leading-relaxed text-blue-200'>
					We have a notion development board, showcasing the current project management and what is being developed currently. 
					You can find it here, at
					<div class='hover:scale-[1.05] transition transition-200'>
						<a href='https://trxmini.notion.site' target="_blank" rel="noreferrer" class='underline'>trxmini.notion.site</a>!
					</div>
				</div>
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
