<script>
	import { slide } from 'svelte/transition';
	import { theme } from '../state/Theme.svelte'

	import Theme from '../state/Theme.svelte'
	import Logo from './reusable/Logo.svelte'
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
	<Logo></Logo>
	<div class="hidden lg:flex lg:items-center lg:gap-10">
		<ul class="flex items-center gap-6">
			{#each menu as item}
				<li>
					{#if item.name == 'Whitepaper'}
						<a href='./' class="text-lg opacity-50" disabled>{item.name}</a>
					{:else}
						<a href={item.url} class="text-lg">{item.name}</a>
					{/if}
				</li>
			{/each}
		</ul>
		<div class="flex items-center gap-4">
			<button
				class="rounded-[10px] border border-blue-500 py-1.5 px-6 text-lg opacity-40 border-opacity-50 font-medium text-[#3C1272] dark:text-white "
			disabled>
				Sign In
			</button>
			<div class='hover:scale-[1.10] mt-3 transition transition-200'>
				<Theme></Theme>
			</div>
		</div>
	</div>
	<button on:click={() => (isOpen = !isOpen)} class="inline-block p-2 lg:hidden">
		<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M3 12H21M3 6H21M9 18H21"
				stroke={$theme == 'dark' ? 'white' : 'black'}
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
			class="fixed inset-x-0 top-0 bg-white/90 dark:bg-[#26262d] py-8 text-gray-800 dark:text-white shadow-lg backdrop-blur-sm lg:hidden"
		>
			<div class="flex items-center justify-between px-4">
				<img src="/img/top-logo.png" alt="Logo" />
				<button on:click={() => (isOpen = !isOpen)} class="p-2">
					<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M18 6L6 18M6 6L18 18"
							stroke={$theme == 'dark' ? 'white' : 'black'}
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"/>
					</svg>
				</button>
			</div>
			<ul class="flex h-full flex-col py-6">
				{#each menu as item}
					<li>
					{#if item.name == 'Whitepaper'}
							<a
								on:click={() => (isOpen = false)}
								href='./'
								class='inline-block w-full py-4 px-4 text-lg font-semibold opacity-50'
							disabled>
								{item.name}
							</a>
					{:else}
							<a
								on:click={() => (isOpen = false)}
								href={item.url}
								class='inline-block w-full py-4 px-4 text-lg font-semibold'
								disabled>
								{item.name}
							</a>
					{/if}
					</li>
				{/each}
			</ul>
			<div class="flex items-center justify-between border-t border-gray-200 px-4 pt-8 ">
				<button
					class="rounded-[10px] border border-blue-500 py-1.5 px-6 
					text-lg font-medium opacity-40 border-opacity-50 text-[#3C1272] dark:text-white"
				>
					Sign In
				</button>
				<div class='ml-2'></div>
				<Theme></Theme>
			</div>
		</div>
	{/if}
</nav>
