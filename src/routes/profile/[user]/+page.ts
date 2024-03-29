export const prerender = false

import { error } from '@sveltejs/kit';
import { 
  connectedAddress, 
  connectedUsername,
  getProfileURL, 
  isProfile, 
  fetchedProfile,
  avatarSrc
} from '../../../lib/state/state'

/** @type {import('./$types').PageLoad} */


export async function load({ fetch, params }) {
  let input = params.user
  let user = input

  let profile
  if (input.includes('.trx') || input.includes('.usdd')) {
    
    console.log(input);

    const res = await fetch(getProfileURL + input);
    
    if (!res.ok) throw new Error('fetch Error, null fetch');
    profile = await res.json();

    fetchedProfile.set(profile);
    if (profile.img) avatarSrc.set(profile.img)
    console.log(profile)
  } else {
    try {
        // with .trx prefix
        const res = await fetch(getProfileURL + user + '.trx')
        if (!res.ok) throw new Error('fetch Error, null fetch')
        profile = await res.json()
        if (profile != undefined) {
          fetchedProfile.set(profile)
          if (profile.img) avatarSrc.set(profile.img)
        } 
        if (profile == undefined && !user.includes('.trx') && !user.includes('.usdd')) {
          // with .usdd prefix
          try {
            const res = await fetch(getProfileURL + user + '.usdd')
            if (!res.ok) throw new Error('fetch Error, null fetch')
            profile = await res.json()
            if (profile != undefined) {
              fetchedProfile.set(profile)
              if (profile.img) avatarSrc.set(profile.img)
            }
          } catch (error) {
            console.log(error)
          }
        }
        
        console.log(profile)
        if (profile) {
          return profile
        }
        
    } catch (error) {
        console.log(error.message)
    }
    throw error (404, 'not found')
  }
  // if ($connectedUsername == $fetchedProfile.username || $defaultUsername == $fetchedProfile.username 
  //   || $connectedUsername == $fetchedProfile.default_username || 
  //   $defaultUsername == $fetchedProfile.default_username) {
  //     isProfile.set(true)
  // }
  //throw error(404, 'Not found');
  
}