<script>
	import Logo from './Logo.svelte'
	import { page } from '$app/stores'
</script>

<section
	id="whitepaper"
	class="bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-500 text-white"
>
	<div class="mx-auto max-w-7xl px-6">
		<div class="py-12 text-center">
			<span class="text-2xl font-medium">More to be announced soon!</span>
		</div>
		<footer class="py-12">
			<div class="border-b border-gray-200 py-4">
				<Logo></Logo>
			</div>
			<div class='flex justify-between'>
				<span class="inline-block pt-4 text-sm font-light text-blue-100 opacity-30 flex flex-wrap">
					trxmini.games developed & created by  <div class='ml-1 hover:scale-[1.06] transition transition-300'><a class='underline' href='http://github.com/nickmura'>Nick Mura</a></div>
				</span>
				{#if !$page.routeId.includes('profile') }
					<span class="inline-block pt-4 text-sm font-light text-blue-200 opacity-20">
						Icons from Wikimedia Commons © 2022. All rights reserved by Jan Uchytil
					</span>
				{:else}
					<span class="inline-block pt-4 text-sm font-light text-blue-200 opacity-30">
						Icons from Wikimedia Commons & Icons8 © 2022. All rights reserved by Sadath N.
					</span>
				{/if}
				

			</div>
		</footer>
	</div>
</section>
