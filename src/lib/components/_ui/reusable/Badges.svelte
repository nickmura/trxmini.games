<script lang="ts">
    //@ts-nocheck
    import { fetchedProfile, profileBadges } from '$lib/state/state'


    let badges = $profileBadges

    
	
    // export let player: {
	// 	name: string;
	// 	bio: string;
	// 	rarity: string;
	// };

    const poolBadge = {
		name: '8 Ball Champion',
		bio: `${$fetchedProfile.username} has completed the beta challenge.`,
		rarity: 'Rare',
        description: ''
	};

	const earlySupporterBadge = {
		name: 'Early Supporter',
        bio: `${$fetchedProfile.username} is an early supporter of trxmini.games.`,
        rarity: 'Uncommon',
        description: 'dsfdsfdsfdsf',
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
        <div class="flex items-center justify-center border-t border-gray-700 p-4">
            <button class="text-gray-50 text-gray-200 hover:scale-[1.05] transition transition-200">View Detail</button>
        </div>
    </div>
{/each}