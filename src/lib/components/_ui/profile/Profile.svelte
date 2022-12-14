<script>
    // @ts-nocheck

	import Navbar from '$lib/components/_ui/reusable/Navbar.svelte';
	import Badges from '$lib/components/_ui/reusable/Badges.svelte';
	import Footer from '$lib/components/_ui/reusable/FooterSection.svelte'

	import { getLevel } from '$lib/state/level'
	import { fetchedProfile, profileBadges } from '$lib/state/state'
	
	console.log($fetchedProfile)
	
	let userPng = Math.floor(Math.random(Math.random() * 100)*100);
	let level 
	async function fetchLevel() {
		level = await getLevel($fetchedProfile.xp)
	}
	if ($fetchedProfile) {
		fetchLevel()
	}
	console.log(level)
	


</script>

<main class="min-h-screen dark:bg-[#16161D]">
	<div class="mx-auto max-w-7xl px-4 pb-12 md:px-6">
		<Navbar/>
	</div>
	<div class="mx-auto max-w-7xl px-4 pb-12 md:px-6">
		<div class="relative h-48 rounded-t-xl bg-gradient-to-br from-fuchsia-600 to-rose-500 tooltip hover:opacity-80">
			<div class="absolute right-0 bottom-0 p-3 ">
				
				<button class="rounded-full bg-white/40 px-5 py-2 text-white" disabled>Edit Cover</button>
				
			</div>
			<div class='tooltip tooltipinfo absolute opacity-80 text-white top-0 ml-2'>Coming soon...</div>
		</div>
		<div class="rounded-b-xl bg-[#111116]">
			<div class="relative pl-4 pr-3 sm:pl-10">
				<div class="">
					{#if userPng <= 20}
						<img
							src="/img/player.png"
							alt="https://www.npmjs.com/package/ethereum-blockies/v/0.1.0?activeTab=readme"
							class="absolute h-32 w-32 -translate-y-1/2 rounded-full object-cover sm:h-40 sm:w-40"
						/>
					{:else if userPng <= 40}
						<img
							src="/img/player2.png"
							alt="https://www.npmjs.com/package/ethereum-blockies/v/0.1.0?activeTab=readme"
							class="absolute h-32 w-32 -translate-y-1/2 rounded-full object-cover sm:h-40 sm:w-40"
						/>
					{:else if userPng <= 60}
						<img
						src="/img/player3.png"
						alt="https://www.npmjs.com/package/ethereum-blockies/v/0.1.0?activeTab=readme"
						class="absolute h-32 w-32 -translate-y-1/2 rounded-full object-cover sm:h-40 sm:w-40"
						/>
					{:else if userPng <= 80}
						<img
						src="/img/player4.png"
						alt="https://www.npmjs.com/package/ethereum-blockies/v/0.1.0?activeTab=readme"
						class="absolute h-32 w-32 -translate-y-1/2 rounded-full object-cover sm:h-40 sm:w-40"
						/>
					{:else if userPng <= 100}
						<img
						src="/img/player5.png"
						alt="https://www.npmjs.com/package/ethereum-blockies/v/0.1.0?activeTab=readme"
						class="absolute h-32 w-32 -translate-y-1/2 rounded-full object-cover sm:h-40 sm:w-40"
						/>
					{/if}
					<div class="flex items-start justify-between gap-2 py-3">
						<div class="flex flex-col gap-1 pl-36 sm:pl-44">
							<h1 class="text-5xl text-white">{$fetchedProfile.username}</h1>
							<span class='italic text-red-500'>Level: {Math.floor(level)}</span>


							<span class="italic text-[#706C6C]">{$fetchedProfile.address.substring(0,5)}...{$fetchedProfile.address.substring(29,34)}</span>
						</div>
						<div class='tooltip'>
							<button
								class="opacity-70  rounded-[10px] border border-transparent bg-gradient-to-r from-blue-500 to-blue-600 py-1.5 px-6 text-lg font-medium text-white"
							disabled>
								Edit
								<span class="hidden sm:inline">profile</span>
							</button>
							<div class='tooltip tooltipinfo absolute opacity-80 text-white mt-2 ml-2'>Coming soon...</div>
						</div>
					</div>
				</div>
			</div>
			<div class="flex items-center gap-4 px-4 pt-12 sm:px-10">
				<button
					class="rounded-[10px] border border-transparent bg-gradient-to-r from-blue-500 to-blue-600 py-1.5 px-6 text-lg font-medium text-white"
				>
					Badges
				</button>
				<div class='tooltip'>
					<button
						class=" tooltip rounded-[10px] border border-transparent bg-transparent py-1.5 px-6 text-lg font-medium text-[#535557] " disabled>
						Marketplace Items
						
					</button>
					<div class='tooltip tooltipinfo absolute opacity-80 ml-10'>Coming soon...</div>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 sm:px-10 md:gap-6 lg:grid-cols-4">
				{#if $profileBadges && $profileBadges.length < 3 && $fetchedProfile}
					<Badges/>
				{/if}
			</div>
		</div>
	</div>
	<Footer></Footer>
</main>

<style>
.tooltip .tooltipinfo {
    visibility: hidden;
    padding: 5px 0;
}

.tooltip:hover .tooltipinfo {
    visibility: visible;
}
</style>