<script>
    import Navbar from '$lib/components/_ui/reusable/Navbar.svelte'
    import CreateGame from '$lib/components/_ui/dialogs/CreateGame.svelte'
    import Chess from '$lib/components/chess/Chess.svelte'
    import TipNotification from '$lib/components/_ui/dialogs/TipNotification.svelte'
</script>
<div class='mx-auto max-w-[88rem] px-4 pb-20 md:px-6'>
    <TipNotification></TipNotification>
    <Navbar></Navbar>
    <CreateGame></CreateGame>
    <Chess></Chess>
</div>