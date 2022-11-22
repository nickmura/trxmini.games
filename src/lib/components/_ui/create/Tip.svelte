<script>
    //@ts-nocheck
    
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    import { tipContract, tipPlayerForm, tipPrompt, connectedAddress, connectedUsername, getBalance } from '$lib/state/state'
    
    let throwErr
    let tip
    let recip
    let userExists = null


    async function checkUniqueUser(uniqueUser) {
        const url3 = `http://170.187.182.220:5001/unique?user=${uniqueUser}.trx`
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
            if (json.unique == false) userExists = true
            if (json.unique == true) userExists = false
    }

    const debounce = (callback, delay) => {
        let debounceTimer;
        return ((...args) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => callback(...args), delay);
        });
    };
    

    const bounceCheckUser = debounce(checkUniqueUser, 250) // Debounce user input to querying database.


    function tipPlayer() {

    }


</script>

<main>
    <div id="container" class='flex flex-initial' class:show={$tipPrompt}>
        	
        <div id="exampleModal" class="absolute reveal-modal overflow-hidden bottom-[8rem] border border-[#b3b2b1] text-black opacity-[98] bg-[#ECECEA] dark:bg-[#2C2C3A] dark:text-white 
        shadow-xL rounded-lg ">
        <button class='absolute flex justify-end w-full' on:click={tipPlayerForm}>
            <span class='p-1 hover:scale-[1.15] transition transition-200'><img alt='cancel' src='/img/cancel.svg' class='w-4 h-4'></span>
        </button>	
        <div class='mt-4 py-6'>
            <h2 class='title font-semibold'>Tip another player TRX</h2>
            <div class='absolute w-full'>
                {#if userExists}
                    <div class='text-green-500 title ' transition:slide>Username exists.</div>
                {:else if userExists == false}
                    <div class='text-red-500 title ' transition:slide>Username/trx domain doesn't exist</div>
                {/if}
            </div>
            <div class='flex justify-center mt-8 min-w-32 mt-'>
                <input bind:value={recip} on:input={(e) => bounceCheckUser(recip)} id="username" name="trxusername" required class="relative px-3 w-72 py-2 
                border dark:bg-[#57575e] border-gray-300 placeholder-gray-500  dark:text-white dark:placeholder-gray-100 bg-gray-100 rounded-lg focus:outline-none 
                focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-light" placeholder="Enter a username here!">
                <div class=''></div>
                <div class='ml-4'>
                    {#if getBalance < tip - 15}  
                        <button on:click={(e)=>tipPlayer(tip, recip)} class=' rounded-[10px] border 
                            border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500 py-1.5 px-6 text-lg 
                            font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                            transition-200'> 
                            Tip Player
                        </button>
                    {:else}
                        <button on:click={(e)=>tipPlayer(tip, recip)} class=' rounded-[10px] border 
                            border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500 py-1.5 px-6 text-lg 
                            font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                            transition-200 opacity-50 border-opacity-50' disabled> 
                            Tip Player
                        </button>
                    {/if}
                </div>
            </div>  
        </div>
            <div class='absolute inset-x-0 bottom-0 mb-4 ml-4 mr-[1.5rem]'>

                <!-- <div class='flex justify-between'>
                    <button class="ml-2 rounded-[10px] border border-indigo-500 dark:border-red-500 
                    py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                    transition-200" on:click={tipPlayerForm}>Cancel</button>
    
                   
                    {#if getBalance < tip - 15}  
                        <button on:click={(e)=>tipPlayer(tip, recip)} class=' rounded-[10px] border 
                            border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500 py-1.5 px-6 text-lg 
                            font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                            transition-200'> 
                            Tip Player
                        </button>
                    {:else}
                        <button on:click={(e)=>tipPlayer(tip, recip)} class=' rounded-[10px] border 
                            border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500 py-1.5 px-6 text-lg 
                            font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                            transition-200 opacity-50 border-opacity-50' disabled> 
                            Tip Player
                        </button>
                    {/if}
                </div> -->
            </div>
        </div>
    </div>
</main>


<style>
    #container {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        visibility:hidden;
        display:none;
        /* background-color: rgba(22,22,22,0.5); */
    }
    
    #container.show {
        z-index: 48;
        visibility: visible;
        display: block;
    }
    
    .reveal-modal {
        margin: 0 auto;
        width:600px; 
        height: 180px;
        position:relative;
        
        z-index:100;
        top: 25%;
        /* padding:30px;  */
        /* -webkit-box-shadow:0 0 10px rgba(0,0,0,0.4);
        -moz-box-shadow:0 0 10px rgba(0,0,0,0.4); 
        box-shadow:0 0 10px rgba(0,0,0,0.4); */
    }
    .title {
        display: flex;
        justify-content: center;
    }
    /* .between {
        display: flex;
        margin-top: 1rem;
        justify-content: space-between;
    } */
    
    /* .tooltip .tooltipinfo {
        visibility: hidden;
        padding: 5px 0;
    }
    
    .tooltip:hover .tooltipinfo {
        visibility: visible;
    } */
    </style>

