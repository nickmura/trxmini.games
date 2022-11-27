<script>
    import Navbar from '$lib/components/_ui/reusable/Navbar.svelte'
    import GameSection from '$lib/components/_ui/GameSection.svelte'
    import CreateGame from '$lib/components/_ui/create/CreateGame.svelte'
    import TipNotification from '$lib/components/_ui/create/TipNotification.svelte';

</script>
<div class='mx-auto max-w-[88rem] px-4 pb-20 md:px-6'>
    <TipNotification></TipNotification>
    <Navbar></Navbar>
    <GameSection></GameSection>
    <CreateGame></CreateGame>
</div>