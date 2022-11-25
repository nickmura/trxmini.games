<script>
	//@ts-nocheck
	import GameSection from '$lib/components/_ui/GameSection.svelte';
	import FaqSection from '$lib/components/_ui/FaqSection.svelte';
	import HeroSection from '$lib/components/_ui/HeroSection.svelte';
	import AboutSection from '$lib/components/_ui/AboutSection.svelte';
	import FooterSection from '$lib/components/_ui/reusable/FooterSection.svelte';
	import RoadmapSection from '$lib/components/_ui/RoadmapSection.svelte';
	import { url2 } from '$lib/state/state'
    // async function peepee() {
    //     const test = await fetch(url2+'nick.trx')
	// 	if (!test.ok) return test.text().then(text => { throw new Error(text) })
	// 	else testaddr = JSON.parse(await test.json())
    //     console.log(testaddr)
    // } setTimeout(peepee, 5500)

</script>

<svelte:head>
	<title>trxmini.games - a staking/wagering arcade GameFi platform</title>
</svelte:head>

<HeroSection />

<AboutSection />

<GameSection />

<RoadmapSection />

<FaqSection />

<FooterSection />
