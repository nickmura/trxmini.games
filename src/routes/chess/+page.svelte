<script>
    import Navbar from '$lib/components/_ui/reusable/Navbar.svelte'
    import CreateGame from '$lib/components/_ui/create/CreateGame.svelte'
    import Chess from '$lib/components/chess/Chess.svelte'

</script>
<div class='mx-auto max-w-[88rem] px-4 pb-20 md:px-6'>
    <Navbar></Navbar>
    <CreateGame></CreateGame>
    <Chess></Chess>
</div>