<script context='module'>
    import { writable } from 'svelte-local-storage-store'
    export const theme = writable('theme', 'dark')
</script>

<script>
    //@ts-nocheck
    import { browser } from '$app/environment'
    //
    let isNight = false
    $: if (browser && $theme == 'dark') {
        document.getElementsByTagName("html")[0].classList.add("dark")
    }
    $: if (browser && $theme == 'light') {
        document.getElementsByTagName("html")[0].classList.remove("dark")
    }

    function setNight() {
        theme.set('dark')
		document.getElementsByTagName("html")[0].classList.add("dark")
        isNight = true
    }
    function setDay() {
        theme.set('light')
        isNight = false
        document.getElementsByTagName("html")[0].classList.remove("dark")
    }
</script>

{#if $theme == 'dark'}
    <button on:click={setDay} class='' >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    </button>
{:else if $theme == 'light'}
    <button on:click={setNight} class='' >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
    </button>
{/if}


<style>

</style>