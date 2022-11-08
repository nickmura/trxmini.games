<script>
    import Navbar from '$lib/components/_ui/reusable/Navbar.svelte'
    import GameSection from '$lib/components/_ui/GameSection.svelte'
    import CreateGame from '$lib/components/_ui/create/CreateGame.svelte'

</script>
<div class='mx-auto max-w-7xl px-4 pb-20 md:px-6'>
    <Navbar></Navbar>
    <GameSection></GameSection>
    <CreateGame></CreateGame>
</div>