<script lang='ts'>

	
	import Navbar from '$lib/components/_ui/reusable/Navbar.svelte';

	import Theme from '$lib/state/Theme.svelte'
	import CreateGame from '$lib/components/_ui/dialogs/CreateGame.svelte'
	import { theme } from '$lib/state/Theme.svelte'
	import TipNotification from "$lib/components/_ui/dialogs/TipNotification.svelte"

	let date
	let target = 1668373200
	let countdown

	// Timer below
	/**
	 * @type {number}
	 */
	let days = 0
	let hours = 0
	let minutes = 0
	let seconds = 0


</script>
<section class="overflow-hidden">

	<div class="mx-auto max-w-7xl px-4 pb-20 md:px-6">
		<Navbar />

		<!-- Hero -->
		<div class="grid grid-cols-1 md:max-lg:place-items-center lg:grid-cols-2">
			<!-- Hero - Left Side -->
			<div
				class="relative z-10 flex max-w-xl flex-col gap-8 pt-16 pb-20 md:max-lg:items-center md:max-lg:text-center"
			>
				<span class="text-lg">trxmini.games presents... </span>
				<h1 class="text-5xl font-light">
					<span class="font-semibold text-[#4957B0]">The First Multiplayer GameFi Mini Games/eSports</span>
					platform on TRON & BTTC
				</h1>
				<p class="text-lg font-light leading-relaxed text-gray-600 dark:text-gray-400">
					trxmini.games is a new multiplayer GameFi platform in beta providing and developing various
					minigames to play against your friends and users online. Players can stake
					and wager against each other in our catalog of turn based, real time and upcoming existing games.
				</p>

				<hr class="max-w-md border-[#5079D0]" />

				<div>
					<button
						class="w-full rounded-[10px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
						hover:scale-[1.05] transition transition-200 py-3 px-6 text-lg font-medium text-white md:w-auto">
						<a href='/#games'>Find Available Games</a>
					</button>
				</div>
				<div class="flex items-center gap-2">
					<span>Inspired by and available on</span>
					{#if $theme == 'light'}
						<img src="/img/tron-logo.png" class="h-8 w-auto" alt="" />
					{/if}
					{#if $theme == 'dark'}
						<img src="/img/tron-logo-dark.png" class="h-8 w-auto" alt="" />
					{/if}
				</div>
			</div>
			<!-- Hero - Right Side -->
			<div class="relative flex min-h-[600px] flex-col items-center justify-end">
				<img
					src="/img/3d-arcade-hero-cover.png"
					class="absolute -top-2 w-[500px] max-w-3xl md:w-auto lg:-right-6 hover:scale-[1.02] transition transition-200"
					alt=""
				/>
				<div
					class="absolute flex max-w-lg flex-col items-center gap-4 rounded-[10px] bg-gradient-to-r from-blue-500 to-blue-800 py-4 px-4 sm:px-12 md:px-16 
					md:ml-9 lg:mr-24 hover:scale-[1.05] transition transition-200 hover:animate-pulse"
				>
					<span class="text-lg font-medium text-white">Our BETA has launched! Play now!</span>
					<div class="flex items-center justify-center gap-3">
						<div class="flex flex-col items-center text-center">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-[10px] border border-white text-xl font-medium text-white sm:h-20 sm:w-20 md:text-2xl"
							>
								{days || days == 0 ? days : ''}
							</div>
							<span class="inline-block pt-1 font-medium uppercase text-white">Days</span>
						</div>
						<div class="flex flex-col items-center text-center">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-[10px] border border-white text-xl font-medium text-white sm:h-20 sm:w-20 md:text-2xl"
							>
								{hours  || hours == 0 ? hours : ''}
							</div>
							<span class="inline-block pt-1 font-medium uppercase text-white">Hours</span>
						</div>
						<div class="flex flex-col items-center text-center">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-[10px] border border-white text-xl font-medium text-white sm:h-20 sm:w-20 md:text-2xl"
							>
								{minutes || minutes == 0 ? minutes : ''}
							</div>
							<span class="inline-block pt-1 font-medium uppercase text-white">Minutes</span>
						</div>
						<div class="flex flex-col items-center text-center">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-[10px] border border-white text-xl font-medium text-white sm:h-20 sm:w-20 md:text-2xl"
							>
								{seconds || seconds == 0 ? seconds : ''}
							</div>
							<span class="inline-block pt-1 font-medium uppercase text-white">Seconds</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	

</style>