<script>
  // @ts-nocheck

import Navbar from '$lib/components/_ui/reusable/Navbar.svelte';
import Badges from '$lib/components/_ui/profile/Badges.svelte';
import Profile from '$lib/components/_ui/profile/Profile.svelte';
import Footer from '$lib/components/_ui/reusable/FooterSection.svelte'

import { getLevel } from '$lib/state/level'
import { fetchedProfile, profileBadges, getProfileURL } from '$lib/state/state'
import { page } from '$app/stores'
import { onMount } from 'svelte';





let userPng = Math.floor(Math.random(Math.random() * 100)*100);

async function fetchLevel() {
  level = await getLevel($fetchedProfile.xp)
}

// console.log(level)



</script>

<Profile/>

<!-- <style>
.tooltip .tooltipinfo {
  visibility: hidden;
  padding: 5px 0;
}

.tooltip:hover .tooltipinfo {
  visibility: visible;
}
</style> -->