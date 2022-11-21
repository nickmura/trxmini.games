<script>
    //@ts-nocheck
    import { onMount } from 'svelte'

    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    import { tipContract, tipPlayerForm, tipPrompt, connectedAddress, connectedUsername, getBalance } from '$lib/state/state'
    
    let throwErr
    let tip
    let recip

    function tipPlayer() {

    }

</script>

<main>
    <div id="container" class='flex flex-initial' class:show={$tipPrompt}>
						
        <div id="exampleModal" class="absolute reveal-modal overflow-hidden bottom-[8rem] border border-[#b3b2b1] text-black opacity-[98] bg-[#ECECEA] dark:bg-[#111112] dark:text-white 
        shadow-xL rounded-lg p-6">
    
            <h2 class='title font-semibold'>Tip another player TRX</h2>

            <!-- <div class='flex wrap py-12 px-8 flex justify-center mx-2 ml-2 border-[#535754]'>
                <div class='font-semibold mt-1.5 text-center'>Are you sure you want to tip player {recip} {tip} TRX?
                </div>


            </div> -->
            <div class=''>
                
            </div>

            <div class='absolute inset-x-0 bottom-0 mb-4 ml-4 mr-[1.5rem]'>
                <div class='flex justify-between'>
                    <button class="ml-2 rounded-[10px] border border-indigo-500 dark:border-red-500 
                    py-1.5 px-6 text-lg font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition
                    transition-200" on:click={tipPlayerForm}>Cancel</button>
    
                    <!-- Change last and operator to selectedRoom.stake > 49 -->
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
    
    .tooltip .tooltipinfo {
        visibility: hidden;
        padding: 5px 0;
    }
    
    .tooltip:hover .tooltipinfo {
        visibility: visible;
    }
    </style>

