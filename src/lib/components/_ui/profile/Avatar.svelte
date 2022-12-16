<script>
    import { avatarPrompt, expandAvatarPrompt, userID, connectedAddress, connectedUsername, postRequest } from '$lib/state/state';
    import { theme } from '$lib/state/Theme.svelte';

    async function postImage() {
        //postRequest()
    }


</script>


    <button on:click={expandAvatarPrompt}><img class='hover:scale-[1.12] transition transition-200
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
        src='/img/camera.svg' alt='camera img'>
        
    </button>

