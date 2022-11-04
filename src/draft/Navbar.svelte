<script>
	import { slide } from 'svelte/transition';

	let isOpen = false;

	let menu = [
		{ name: 'About', url: '/#about' },
		{ name: 'Games', url: '/#games' },
		{ name: 'Roadmap', url: '/#roadmap' },
		{ name: 'FAQs', url: '/#faq' },
		{ name: 'Whitepaper', url: '/#whitepaper' }
	];

	
</script>

<nav class="relative z-50 flex items-center justify-between py-8">
	<div class="flex-shrink-0">
		<img src="/img/top-logo.png" width='250px' height='65px' alt="Logo" />
	</div>
	<div class="hidden lg:flex lg:items-center lg:gap-10">
		<ul class="flex items-center gap-6">
			{#each menu as item}
				<li><a href={item.url} class="text-lg">{item.name}</a></li>
			{/each}
		</ul>
		<div class="flex items-center gap-4">
			<button
				class="rounded-[10px] border border-blue-500 py-1.5 px-6 text-lg font-medium text-[#3C1272]"
			>
				Sign In
			</button>
			<button
				class="rounded-[10px] border border-transparent bg-gradient-to-r from-blue-500 to-blue-600 py-1.5 px-6 text-lg font-medium text-white"
			>
				Get Started
			</button>
		</div>
	</div>
	<button on:click={() => (isOpen = !isOpen)} class="inline-block p-2 lg:hidden">
		<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M3 12H21M3 6H21M9 18H21"
				stroke="black"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
	<!-- Mobile Dropdown -->
	{#if isOpen}
		<div
			transition:slide
			class="fixed inset-x-0 top-0 bg-white/90 py-8 text-gray-800 shadow-lg backdrop-blur-sm lg:hidden"
		>
			<div class="flex items-center justify-between px-4">
				<img src="/img/logo.svg" alt="Logo" />
				<button on:click={() => (isOpen = !isOpen)} class="p-2">
					<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M18 6L6 18M6 6L18 18"
							stroke="black"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>
			<ul class="flex h-full flex-col py-6">
				{#each menu as item}
					<li>
						<a
							on:click={() => (isOpen = false)}
							href={item.url}
							class="inline-block w-full py-4 px-4 text-lg font-semibold"
						>
							{item.name}
						</a>
					</li>
				{/each}
			</ul>
			<div class="flex items-center justify-between border-t border-gray-200 px-4 pt-8">
				<button
					class="rounded-[10px] border border-blue-500 py-1.5 px-6 text-lg font-medium text-[#3C1272]"
				>
					Sign In
				</button>
				<button
					class="rounded-[10px] border border-transparent bg-gradient-to-r from-blue-500 to-blue-600 py-1.5 px-6 text-lg font-medium text-white"
				>
					Get Started
				</button>
			</div>
		</div>
	{/if}
</nav>
