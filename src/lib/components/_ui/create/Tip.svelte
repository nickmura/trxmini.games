<script>
    //@ts-nocheck
    
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    import { tipContract, tipPlayerForm, tipPrompt, connectedAddress, connectedUsername, getBalance, url2 } from '$lib/state/state'
    
    let throwErr
    let hasClicked = false
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
    

    const bounceCheckUser = debounce(checkUniqueUser, 300) // Debounce user input to querying database.


    let isExpanded = false
    async function tipPlayerExpanded() {
        isExpanded = !isExpanded
    }
    async function tipPlayer(amount, recipient) {
        try {
            let recipAddr
            
            async function getAddress() {
                const test = await fetch(url2+recipient)
	            if (!test.ok) return test.text().then(text => { throw new Error(text) })
	            recipAddr = await test.json()
                recipAddr = recipAddr.address
                console.log(recipAddr)
            } await getAddress()
            hasClicked = true
            let uuid = Math.floor(Math.random()*1000000) //gameID

            let sun = amount*1000000
            console.log(uuid, sun, recipAddr)
            var parameter = [{type:'uint32',value:uuid}, {type:'uint64',value:sun}, {type:'address',value:recipAddr}]
            var options = {
                callValue: sun,
                feeLimit: 100000000,
            }

            //invoking contract function
            const tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                window.tronWeb.address.toHex(tipContract), "tip(uint32,uint64,address)",
                options, parameter, window.tronWeb.address.toHex($connectedAddress))
            const signedTx = await tronWeb.trx.sign(tx.transaction);
            const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx);
            socket.emit('tippedPlayer', $connectedAddress, recipAddr, amount);
        } catch (error) {
            hasClicked = false
        }
    }


</script>

<main>
    <div id="container" class='flex flex-initial' class:show={$tipPrompt}>
        	
        <div id="exampleModal" class="absolute reveal-modal overflow-hidden bottom-[8rem] border border-[#b3b2b1] text-black opacity-[98] bg-[#ECECEA] dark:bg-[#16161d] dark:text-white 
        shadow-xl rounded-lg">
        <button class='absolute flex justify-end w-full ' on:click={tipPlayerForm}>
            <span class='p-1 hover:scale-[1.15] transition transition-200 hover:bg-green'><img alt='cancel' src='/img/cancel.svg' class='w-4 h-4 '></span>
        </button>	
        <div class='mt-4 py-2 w-full'>
            <h2 class='title font-semibold'>Tip another player TRX</h2>
            <div class='absolute w-full'>
                {#if userExists}
                    <div class='text-green-500 title ' transition:slide>Username exists.</div>
                {:else if userExists == false && recip != ''}
                    <div class='text-red-500 title ' transition:slide>Username/trx domain '{recip}.trx' does not exist</div>
                {/if}
            </div>
            <div class='flex justify-center mt-8 min-w-32 '>
                <div class='relative'>
                    <input bind:value={recip} on:input={(e) => bounceCheckUser(recip)} id="username" name="trxusername" required class="relative px-3 w-72 py-2 
                        border dark:bg-[#57575e] border-gray-300 placeholder-gray-500  dark:text-white dark:placeholder-gray-100 bg-gray-100 rounded-lg focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-light" placeholder="Enter a username here!">

                    <div class='absolute top-0 right-0 text-xl dark:text-gray-200 mr-2 mt-1 pointer-events-none '>| .trx</div>
                <div>
                <div class='relative mt-4'>
                    <input bind:value={tip} on:input={tip} id="username" name="trxtip" type='number' required class="relative px-3 w-72 py-2 
                        border dark:bg-[#57575e] border-gray-300 placeholder-gray-500  dark:text-white dark:placeholder-gray-100 bg-gray-100 rounded-lg focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-light" placeholder="Enter an amount here!">
                </div>
                <div class='relative mt-1 text-xs text-gray-300 flex justify-end'>Balance: {Math.round(100*$getBalance)/100} TRX</div>
                


            </div>
            
        </div>
        
            <div class='absolute inset-x-0 bottom-0 mb-4 ml-4 mr-[1.5rem]'>
                {#if recip && tip}
                    <div class='pt-6'>
                        <div class='flex justify-center'></div>
                        <div class='flex justify-center'>Fee: 3 TRX</div>
                    </div>
                {/if}
                <div class='flex justify-center'>
                    {#if tip - 15 < $getBalance && userExists && tip > 10}  
                        <button on:click={tipPlayerExpanded} class=' rounded-[10px] border 
                            border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500 py-1.5 px-6 text-lg 
                            font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                            transition-200'> 
                            Tip Player
                        </button>
                    {:else}
                        <button class=' rounded-[10px] border 
                            border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500 py-1.5 px-6 text-lg 
                            font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                            transition-200 opacity-50 border-opacity-50' disabled> 
                            Tip Player
                        </button>
                    {/if}
                </div>

            </div>
        {#if isExpanded}
            <div class='absolute border rounded-lg w-[420px] h-48 mb-2 dark:bg-[#16161d] bg-[#ECECEA] z-20 '>
                <h1 class='flex justify-center px-4 py-4 text-center'>Are you sure you want to tip {recip}.trx {tip} TRX ? You cannot undo the transaction
                once you sign it!</h1>
                <div  class='absolute inset-x-0 bottom-0 mb-4 ml-4 mr-[1.5rem] flex justify-between'>
                    <button on:click={tipPlayerExpanded} class='rounded-[10px] border py-1.5 px-6 text-lg 
                    font-medium border-red-500 hover:border-red-600 text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                    transition-200'>Cancel</button>
                    {#if !hasClicked}
                        <button on:click={(e)=> tipPlayer(tip, `${recip}.trx`)} class='rounded-[10px] border 
                            border-indigo-500 dark:hover:border-emerald-500 dark:border-blue-500 hover:border-emerald-500 py-1.5 px-6 text-lg 
                            font-medium text-[#3C1272] dark:text-white hover:scale-[1.05] transition 
                            transition-200'> 
                            Send
                        </button>
                    {:else}
                        <button class='rounded-[10px] border 
                            border-emerald-500  dark:border-emerald-500  py-1.5 px-6 text-lg 
                            font-medium text-[#3C1272] dark:text-white transition 
                            transition-200 opacity-50 border-opacity-50' disabled> 
                            Send
                        </button>
                    {/if}
                </div>
            </div>
        {/if}
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
        width:450px; 
        height: 320px;
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

