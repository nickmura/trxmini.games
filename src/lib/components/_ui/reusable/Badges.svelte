<script lang="ts">
    //@ts-nocheck
    import { fetchedProfile, profileBadges } from '$lib/state/state'


    let badges = $profileBadges
    let description
    let badge = {
        name: '',
        bio: '',
        rarity: '',
        description: '',
    }
    
	
    // export let player: {
	// 	name: string;
	// 	bio: string;
	// 	rarity: string;
	// };

    const poolBadge = {
		name: '8 Ball Champion',
		bio: `${$fetchedProfile.username} has completed the beta challenge.`,
		rarity: 'Rare',
        description: `The <b>'8 Ball Champion'</b> badge/token is given to those who completed and conquered our AI in the 8 ball challenge, during our beta!
        Thank you for being a super supporter of the challenge, and you will be given a future cosmetic for this achievement.`
	};

	const earlySupporterBadge = {
		name: 'Early Supporter',
        bio: `${$fetchedProfile.username} is an early supporter of trxmini.games.`,
        rarity: 'Uncommon',
        description: `The <b>'Early Supporter'</b> badge/token is given to those who participated in the
        early development and progress of trxmini.games. They authenticated themselves on our platform and
        created a username. In the near future, they will be given a reward for their contributions. Thank you.`,
	}


    function checkBadges() {
        if ($fetchedProfile.is_beta && !badges.find(badge => badge.name == 'Early Supporter')) {
            badges.push(earlySupporterBadge)
            profileBadges.set(badges)
        }
        if ($fetchedProfile.has_won_8ball && !badges.find(badge => badge.name == '8 Ball Champion')) {
                badges.push(poolBadge)
                profileBadges.set(badges)
                console.log($profileBadges)
        } 
    } checkBadges()


    let isExpanded = false
    function viewDetails(selectedBadge) {
        isExpanded = !isExpanded
        badge=selectedBadge
       
    }


</script>
{#each badges as badge}
    <div class="flex flex-col rounded-xl bg-[#1E1E32] hover:scale-[1.05] transition transition-300">
        <div class="p-4">

            <div class="flex items-center justify-center pt-3">


                {#if badge.name == 'Early Supporter'}
                    <img src="/img/beta_supporter.png" alt="" class="h-32 w-32" />
                {:else}
                    <img src="/img/8ball_medal.png" alt="" class="h-32 w-32" />
                {/if}
            </div>

            <div class="pt-10">
                <h2 class="text-xl font-medium text-white">{badge.name}</h2>
                <p class="text-sm text-[#D9D9D9]/50 ">{badge.bio}</p>
                {#if badge.rarity == 'Rare'}
                    <span class="inline-block pt-4 text-xl font-medium text-[#FCB449]/80">{badge.rarity}</span>
                {:else if badge.rarity == 'Uncommon'}
                    <span class="inline-block pt-4 text-xl font-medium text-indigo-400">{badge.rarity}</span>
                {/if}

            </div>
        </div>
        <div class="flex z-40 items-center justify-center border-t border-gray-700 p-4">
            <button on:click={(e)=> viewDetails(badge)} class="text-gray-50 text-gray-200 hover:scale-[1.05] transition transition-200">View Detail</button>
        </div>
    </div>
    
{/each}
<div id="container" class='flex flex-initial' class:show={isExpanded}>
						
    <div id="exampleModal" class="absolute reveal-modal overflow-hidden bottom-[8rem] opacity-[98] bg-[#1E1E32] text-white
    shadow-xl rounded-lg p-6">

        {#if badge.rarity == 'Uncommon'}
            <h2 class='title font-semibold text-indigo-400'>{badge.name}</h2>
        {:else}
            <h2 class='title font-semibold text-[#FCB449]/80'>{badge.name}</h2>
        {/if}
        <div class=''>
            <div class='flex justify-center h-[16rem] mt-3 '>
                <div class=' 
                rounded-lg w-full'>
                
                    <div class='flex justify-center text-center text-red-300'>
                        {#if badge.name == 'Early Supporter'}
                            <img src="/img/beta_supporter.png" alt="" class="h-32 w-32" />
                        {:else}
                            <img src="/img/8ball_medal.png" alt="" class="h-32 w-32" />
                        {/if}

                    </div>
                    <div class='flex wrap  px-8 flex justify-center mx-2 ml-2 border-[#535754]'>
                        <div class=' mt-1.5 text-center'>{@html badge.description}
                        </div>


                        </div>

                    
                    
                </div>  
                
            </div>
        </div>

        <div class='absolute inset-x-0 bottom-0 mb-4 ml-4 mr-[1.5rem]'>
            <div class='flex justify-center'>
                <button class="ml-2 rounded-[10px] border border-indigo-500 dark:border-red-500 
                py-1.5 px-6 text-lg font-medium text-white hover:scale-[1.05] transition
                transition-200" on:click={(e)=> viewDetails(badge)}>Cancel</button>
            </div>
            
        </div>
    </div>
</div>

<style>
    #container {
        width: 100%;
        position: absolute;
        top: 5;
        bottom: 10;
        left: 0;
        visibility:hidden;
        display:none;
    }
	

	#container.show {
		z-index: 20;
		visibility: visible;
		display: block;
	}
	

	.reveal-modal {
		margin: 0 auto;
		width:600px; 
		height: 400px;
		position:relative;
		z-index:100;
        padding:30px; 
		-webkit-box-shadow:0 0 10px rgba(0,0,0,0.4);
		-moz-box-shadow:0 0 10px rgba(0,0,0,0.4); 
		box-shadow:0 0 10px rgba(0,0,0,0.4);
	}


	.title {
		display: flex;
		justify-content: center;
	}

</style>