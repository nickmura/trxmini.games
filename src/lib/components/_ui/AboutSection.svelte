<script>

	import { createGameForm, selectedOption, createPrompt } from "$lib/state/state";


	function play8Ball() {
		selectedOption.set('8 Ball')
		createPrompt.set(true)
	}
</script>
<section id="about">
	<div class="mx-auto max-w-7xl px-4 py-20 md:px-6">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div
				class="max-w-sm place-self-center sm:px-12 md:max-w-max md:place-self-start md:px-8 lg:px-16 hover:scale-[1.04] transition transition-200"
			>
				<img src="/img/pool-chess-cover-2nd-slide.png" alt="" />
			</div>
			<div class="flex max-w-xl flex-col gap-8">
				<span class="text-lg">OUR MISSION IS TO...</span>
				<h2 class="text-3xl font-medium md:text-4xl">
					Provide an engaging & unique platform to represent
					<span class="font-bold text-[#4957B0]"> GameFi</span>
				</h2>
				<p class="text-lg font-light leading-relaxed text-gray-600 dark:text-gray-400">
					Providing an accessible, intrinsic service for users & players to wager and stake their
					games, whether for casual or competitve purposes, will allow many opportunities to grow
					GameFi by colliding with many different new and existing communities of players
					internationally.
				</p>
				<p class="text-lg font-md leading-relaxed text-gray-600 dark:text-gray-400">
					We are confident that our platform & network will continue to scale into new environments
					and games, with a wide variety of features for both casual and competiive players. We intend
					to provide the best platform GameFi has to offer.
				</p>
			</div>
		</div>
	</div>
	<div class="mx-auto max-w-7xl px-4 py-20 md:px-6">
		<div class="">
			<div class=" flex text-center  flex-col gap-8 md:row-auto">
				<h2 class="text-3xl font-medium md:text-4xl">How our protocol works</h2>
				<p class="text-lg font-light leading-relaxed text-gray-600 dark:text-gray-400">
					Players can start or join another player's game for a specified wager/stake of supported
					tokens on TRON, which will be stored on one of our escrow smart contracts. The player
					who wins the game, gets the prize pool of the entire stake! Players will
					also be able to play the same games with no stake.
				</p>
				<p class="text-lg font-light leading-relaxed text-gray-600 dark:text-gray-400">
					We are intending to offer 2-3 games by the start of the beta - chess, drawades,
					and 8 ball pool! Currently, you can enter into the challenge of the beta protocol -
					beat our bot at 8 ball pool, and receive a badge, future token credits, aswell as exclusive future
					cosmetics and features for completing the challenge.
				</p>
				<p class="text-lg font-light leading-relaxed text-gray-600 dark:text-gray-400">
					We intend to provide a team of dedicated, experienced developers who share the
					same goal of developing the standard of GameFi applications across any chain. <b>After
					the beta, we will continue to update our catalog with new minigames and immersive features
					in the near future.</b> More info 
					<a href='/#roadmap'><button class='hover:scale-[1.05] transition transition-200 hover:text-3EA2FF'><span class="text-[#3DA2FF]">on our roadmap below</span></button></a>.
				</p>
			</div>

		</div>
		<div class="grid grid-cols-1 gap-12 pt-20 md:grid-cols-3 ">
			<button class='' on:click={createGameForm}><a href='/#'>
			<div class="flex flex-col items-center gap-4 hover:scale-[1.10] transition transition-300">
				<img src="/img/chess-game.png" class="w-24 md:w-32 lg:w-36" alt="" />
				<span class="inline-block px-6 text-center text-lg font-light text-gray-600 dark:text-gray-400">
					Play and bet chess with a friend! Winner takes all stake.
				</span>
			</div>
			</a>
			</button>
			
				<!-- <button class='' on:click={createGameForm}><a href='/#'>
					<div class="flex flex-col items-center gap-4 hover:scale-[1.10] transition transition-300">
						<img src="/img/8ball.png" class="w-24 md:w-32 lg:w-36" alt="" />
						<span class="inline-block px-6 text-center text-lg font-light text-gray-600 dark:text-gray-400">
							Beat our AI at 8 ball and get future exclusive features and a badge!
						</span>
					</div>
					</a>
				</button> -->
				<button on:click={play8Ball} class='hover:scale-[1.10] transition transition-200'><a href="/#">
					<div class="flex flex-col items-center justify-center gap-6 animate-pulse hover:scale[1.1]">
						
							<img src="/img/8ball.png" class="w-24 md:w-32 lg:w-36 flex justify-center items-center" alt="" />
							<span class="inline-block px-6 text-center text-lg font-light text-gray-600 dark:text-gray-400">
								Beat our AI at 8 ball and get future exclusive features and a badge!
							</span>
					</div>
				</a>
				</button>
			
			<div>
				<div class='text-2xl absolute flex mx-[7.05rem] mt-32 z-20 dark:text-blue-500 indigo:text-indigo-500 font-semibold'>Coming soon!</div>
				<div class="flex flex-col items-center gap-4 opacity-40">
					
					<img src="/img/palette.png" class="w-24 md:w-32 lg:w-36" alt="" />
					<span class="inline-block px-6 text-center text-lg font-light text-gray-600 dark:text-gray-400">
						Play Drawades with your friends! A player draws something and others guess. No staking
						required.
					</span>
				</div>
			</div>

		</div>
		
	</div>
</section>
