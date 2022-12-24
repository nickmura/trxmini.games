<script>
    // @ts-nocheck

	import Navbar from '$lib/components/_ui/reusable/Navbar.svelte';
	import Badges from '$lib/components/_ui/profile/Badges.svelte';
	import Footer from '$lib/components/_ui/reusable/FooterSection.svelte'
	
	import Avatar from './Avatar.svelte'

	import { getLevel } from '$lib/state/level'
	import { connectedUsername, connectedAddress, fetchedProfile, profileBadges, avatarPrompt, expandAvatarPrompt, uploadAvatarURL, trxDomains, getDomains } from '$lib/state/state'


	let userPng = Math.floor(Math.random(Math.random() * 100)*100);
	let uploadedAvatar
	let level 
	async function fetchLevel() {
		level = await getLevel($fetchedProfile.xp)
	}
	if ($fetchedProfile) {
		fetchLevel()
	}
	console.log(level)
	
	async function postImage(avatar) {
		console.log(avatar)
	}

	let isProfile = false
	async function profileIsUser() {
		if ($fetchedProfile == $connectedUsername) {
			isProfile = true
		}

	} profileIsUser()

		// function test() {
		// 	console.log('CHECK BADGES NOW', $profileBadges)
		// 	console.log('1234')
		// }

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
			<div class='tooltip tooltipinfo absolute  opacity-80 text-white top-0 ml-2'>Coming soon...</div>
		</div>
		<div class="rounded-b-xl bg-[#111116]">

			<div class="relative pl-4 pr-3 sm:pl-10">
				<div class="">
					<div class='relative tooltip group'>
						<img
						src="/img/player5.png"
						alt="https://www.npmjs.com/package/ethereum-blockies/v/0.1.0?activeTab=readme"
						class="absolute h-32 w-32 -translate-y-1/2 rounded-full object-cover sm:h-40 sm:w-40 group-hover:opacity-70">

						<div class='tooltipinfo absolute h-32 w-32 -translate-y-1/2  sm:h-40 sm:w-40 '>
							<Avatar />
						</div>

					</div>
					<div class="flex items-start justify-between gap-2 py-3">
						<div class="flex flex-col gap-1 pl-36 sm:pl-44">
							<div class='flex-wrap'>
								<h1 class="text-5xl text-white">{$fetchedProfile.username}</h1>
								
							</div>

							<span class='italic text-red-500'>Level: {Math.floor(level)}</span>


							<span class="italic text-[#706C6C]">{$fetchedProfile.address.substring(0,5)}...{$fetchedProfile.address.substring(29,34)}</span>
						</div>
						<div class='tooltip'>
							<button
								class="opacity-70  rounded-[10px] border border-transparent bg-gradient-to-r from-blue-500 to-blue-600 py-1.5 px-6 text-lg font-medium text-white"
							>
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
				{#if $profileBadges && $fetchedProfile}
					<Badges/>
				{/if}
			</div>
		</div>
	</div>
	<div id="container" class='flex flex-initial' class:show={$avatarPrompt}>
						
		<div id="exampleModal" class="absolute reveal-modal overflow-hidden translate-y-1/2 opacity-[98] bg-[#1E1E32] text-white
		shadow-xl rounded-lg p-6">
				<h2 class='flex title font-semibold justify-center text-gray-200 '>Change Avatar</h2>
			<form action={uploadAvatarURL} method='POST'>
				<div class=''>
					<div class='flex justify-center h-[16rem] mt-3 '>
						<div class=' 
						rounded-lg w-full'>
						
							<div class='flex justify-center text-center text-red-300'>

							</div>

							<div class='flex-wrap px-8 flex justify-center mx-2 ml-2 border-[#535754]'>
								<div class='text-center text-sm'>
									Please upload a 1:1 image for best quality.
								</div>
								
									<div class='flex px-8 justify-center text-center w-full'>
										<input bind:value={uploadedAvatar} type="file"
										id="avatar" name="avatar"
										accept="image/png, image/jpeg">
									</div>
								
							</div>
		
							
							
						</div>  
						
					</div>
				</div>
		
				<div class='absolute inset-x-0 bottom-0 mb-4 ml-4 mr-[1.5rem]'>
					<div class='flex justify-between'>
						<button class="ml-2 rounded-[10px] border border-red-500 
						py-1.5 px-6 text-lg font-medium text-white hover:scale-[1.05] transition
						transition-200" on:click={expandAvatarPrompt}>Cancel</button>
						<button class="ml-2 rounded-[10px] border border-green-500 
						py-1.5 px-6 text-lg font-medium text-white hover:scale-[1.05] transition
						transition-200" on:click={(e)=>postImage(uploadedAvatar)}>Apply</button>
					</div>
					
				</div>
		</form>
		</div>
		
	</div>

	<Footer></Footer>
</main>

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
		width:400px; 
		height: 200px;
		position:relative;
		
		z-index:100;
		;
		/* padding:30px;  */
		/* -webkit-box-shadow:0 0 10px rgba(0,0,0,0.4);
		-moz-box-shadow:0 0 10px rgba(0,0,0,0.4); 
		box-shadow:0 0 10px rgba(0,0,0,0.4); */
	}

.tooltip .tooltipinfo {
    visibility: hidden;
    padding: 5px 0;
}

.tooltip:hover .tooltipinfo {
    visibility: visible;
}
</style>