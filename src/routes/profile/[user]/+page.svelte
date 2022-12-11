<script>
    //@ts-nocheck
    import { fetchedProfile } from '$lib/state/state'
  
    /** @type {import('./$types').PageData} */
    console.log($fetchedProfile)
    
    export let data;
    let profile = data;
   
</script>
  
  <h1>{profile.address}</h1>
  <div>{@html profile.username}</div>
  <div>{@html profile.has_played}</div>
  <div>{@html profile.games_played}</div>
  <div>{@html profile.is_beta}</div>
  <div>{profile.games_won}</div>