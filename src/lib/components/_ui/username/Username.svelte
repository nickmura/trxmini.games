<script>
    //@ts-nocheck
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation';
    
    import { connectedAddress, connectedUsername } from '$lib/state/state'
    import { url0, url1 } from '$lib/state/state'


    //This needs to be assigned when the query parameter is actually defined. Otherwise, it will provide the parameter undefined.
    //const url2 = `//172.105.106.183:5001/username?addr=${$connectedAddress}`

    let username 
    
    let user
    let isExpanded = false
    let errorHandling
    let setUsername = false
    let isUnique = true
    $: isUnique
    let init = false

    async function setUserWarning() {
        isExpanded = !isExpanded
    }


    async function createUsername(username) {
        if (!$connectedAddress) {
            errorHandling = 'Connect to Tronlink wallet first before creating a username.'
        } else {
            let user = JSON.stringify({address: $connectedAddress, name: username})
            const submitData = async (url) => { // sending address to express and postgres
                const res = await fetch(url, {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: user,
                })
                if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                return res
            }
        submitData(url1)
            .then(res => console.log(res))
            .catch(err => console.error(err))
        goto('../')
        }
    }




    async function checkUniqueUser(uniqueUser) {
        const url3 = `http://172.105.106.183:5001/unique?user=${uniqueUser}`
        let user = JSON.stringify({name: uniqueUser})
            const submitData = async (url) => { // sending address to express and postgres
                const res = await fetch(url, {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: user,
                })
                if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                return res
            }
        const res = await submitData(url3)
            const json = await res.json()
            console.log(json.unique)
            if (json.unique == false) isUnique = false
            if (json.unique == true) isUnique = true
    }

    const debounce = (callback, delay) => {
        let debounceTimer;
        return ((...args) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => callback(...args), delay);
        });
    };
    
    const bounceCheckUser = debounce(checkUniqueUser, 250) // Debounce user input to querying database.

</script>



    <div class='flex flex-initial  flex-col justify-center text-center items-center w-full min-h-screen ' transition:slide>
        
        <h1 class='flex-initial pl-4 pr-4 pb-2 text-4xl dark:text-white' transition:slide>
            Get a unique username domain on us, free for
            participating in the beta.</h1>

            {#if $connectedAddress && $connectedUsername && username}
                <div class='text-sm text-red-400 italic max-w-3/4 w-3/4 text-gray-400 dark:hover:text-red-200' transition:slide>
                    You already have a username!
                </div>
            {:else if $connectedAddress && username && !isUnique}
                <div class='text-sm text-red-400 italic max-w-3/4 w-3/4 text-red-400 dark:hover:text-red-200' transition:slide>
                        This username is already taken.
                </div>
            {:else if $connectedAddress && username && !username.includes('.trx') && isUnique}
                <div class='text-sm text-green-400 italic max-w-3/4 w-3/4 text-red-400 dark:hover:text-red-200' transition:slide>
                    This username is available.
                </div>
            {:else if $connectedAddress && username && username.includes('.trx')}
                <div class='text-sm text-red-400 italic max-w-3/4 w-3/4 text-red-400 dark:hover:text-red-200' transition:slide>
                    Remove any instance of '.trx', as it will be added to your username inherently. 
                </div>
            {:else}
                <div class='text-sm text-zinc-400 italic max-w-3/4 w-3/4 text-gray-400 dark:hover:text-gray-200'>
                    Personalize your address on our platform, and receive
                    compensation for participation after the beta!
                </div>
            {/if}
            
        <div class="relative rounded-md max-w-3/4 shadow-sm -space-y-px mt-4 flex-row">
            <div class='flex items-center'>
                <label for="trxusername" class="sr-only">username</label>
                {#if $connectedAddress}
                    <input bind:value={username} on:input={(e) => bounceCheckUser(username)} id="username" name="trxusername" required class="relative px-3 py-2 
                    border dark:bg-[#57575e] border-gray-300 placeholder-gray-500  dark:text-white dark:placeholder-gray-100 bg-gray-100 rounded-lg focus:outline-none 
                    focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-light" placeholder="Enter a username here!">
                {:else}
                <input bind:value={username} on:input={(e) => bounceCheckUser(username)} id="username" name="username" required class="relative w-full opacity-50 px-3 py-2 border dark:bg-[#57575e] border-gray-300 placeholder-gray-500  dark:text-white dark:placeholder-gray-100 rounded-lg focus:outline-none 
                focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium" placeholder="Enter a username here!" disabled>
                {/if}
                {#if !username || username.includes('.trx')}
                    <button on:click={setUserWarning} class="rounded-[10px] border border-indigo-500 ml-2 dark:border-blue-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white opacity-50 border-opacity-50" disabled>
                    <span class="">Create </button>
                {:else if username && $connectedUsername || !isUnique}
                <button class="rounded-[10px] border border-indigo-500 ml-2 dark:border-blue-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white opacity-50 border-opacity-50" disabled>
                <span class="">Create</button>
                {:else if username && !$connectedUsername}
                    <button on:click={setUserWarning} class="rounded-[10px] border border-indigo-500 ml-2 dark:border-blue-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                    transition-200">
                    Create</button>
                {/if}
            </div>
        </div>

        <div id="container" class:show={isExpanded}>
						
            <div id="exampleModal" class="reveal-modal  dark:bg-[#27272e] dark:text-white rounded-lg hover:scale-[1.03] transition transition-200">

                <h2 class='title'>Username: {username ? username : ''}.trx</h2>
                {#if errorHandling}
                    {errorHandling}
                {/if}
                <p class='warning'>
                Are you sure you want this username? You cannot change your
                username after you've created it. 
    
                </p>
                <!-- svelte-ignore a11y-invalid-attribute -->
                <div class='between'>
                    <button class="rounded-[10px] border border-indigo-500 ml-2 dark:border-red-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                    transition-200" on:click={setUserWarning}>Cancel</button>


                    
                    <button on:click={(e)=>createUsername(username)} class='rounded-[10px] border border-indigo-500 ml-2 dark:border-blue-500 py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                        transition-200'> 
                        Set Username
                    </button>
                </div>
            </div>
            </div>
        
    </div>

<style>
    #container {
			width: 100%;
			height: 100%;
			
			position: fixed;
			top: 0;
			left: 0;
			visibility:hidden;
			display:none;
			background-color: rgba(22,22,22,0.5);
		}

		#container.show {
			visibility: visible;
			display: block;
		}

		.reveal-modal {
			margin: 0 auto;
			width:360px; 
            
			position:relative; 
			z-index:41;
			top: 25%;
			padding:30px; 
			-webkit-box-shadow:0 0 10px rgba(0,0,0,0.4);
			-moz-box-shadow:0 0 10px rgba(0,0,0,0.4); 
			box-shadow:0 0 10px rgba(0,0,0,0.4);
		}
		.title {
			display: flex;
			justify-content: center;
		}
		.between {
			display: flex;
			margin-top: 1rem;
			justify-content: space-between;
		}
</style>