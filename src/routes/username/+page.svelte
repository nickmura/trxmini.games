<script>
    // @ts-ignore
    import Navbar from '$lib/components/_ui/reusable/Navbar.svelte'
    import Username from '$lib/components/_ui/username/Username.svelte'
    import TipNotification from '$lib/components/_ui/dialogs/TipNotification.svelte';
</script>

<main class=''>
    <TipNotification></TipNotification>
    <section class="overflow-hidden">
        <div class='fixed inset-x-0 top-0'>
            <div class="mx-auto max-w-[88rem] px-4 pb-20 md:px-6">

                <Navbar></Navbar>


            </div>
        <div class='ml-2 mt-2 mr-2 font-serif flex justify-between'>

        </div>
    </div>
    </section>
    
    <Username></Username>
</main>