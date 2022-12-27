export const prerender = false

import { error } from '@sveltejs/kit';
import { 
  connectedAddress, 
  connectedUsername,
  getProfileURL, 
  isProfile, 
  fetchedProfile,
} from '$lib/state/state'

/** @type {import('./$types').PageLoad} */


export async function load({ fetch, params }) {
  let input = params.user
  let user = input

  let profile
  if (input.includes('.trx') || input.includes('.usdd')) {
    console.log(input)
    const res = await fetch(getProfileURL + input)
    if (!res.ok) throw new Error('fetch Error, null fetch')
    
    profile = await res.json();
    fetchedProfile.set(profile)
    console.log(profile)
  } else {
    try {
        // with .trx prefix
        const res = await fetch(getProfileURL + user + '.trx')
        if (!res.ok) throw new Error('fetch Error, null fetch')
        profile = await res.json()
        if (profile != undefined) fetchedProfile.set(profile)
        if (profile == undefined && !user.includes('.trx') && !user.includes('.usdd')) {
          // with .usdd prefix
          try {
            const fetch = await fetch(getProfileURL + user + '.usdd')
            if (!fetch.ok) throw new Error('fetch Error, null fetch')
            profile = await fetch.json()
            if (profile != undefined) fetchedProfile.set(profile)
          } catch (error) {
            console.log(error)
          }
        }
        
        
        return profile
    } catch (error) {
        console.log(error.message)
    }
  }
  // if ($connectedUsername == $fetchedProfile.username || $defaultUsername == $fetchedProfile.username 
  //   || $connectedUsername == $fetchedProfile.default_username || 
  //   $defaultUsername == $fetchedProfile.default_username) {
  //     isProfile.set(true)
  // }
  //throw error(404, 'Not found');
  
}