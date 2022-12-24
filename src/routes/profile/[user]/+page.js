export const prerender = false

import { error } from '@sveltejs/kit';
import { getProfileURL, isProfile, fetchedProfile } from '$lib/state/state'

/** @type {import('./$types').PageLoad} */
//export function load({ params }) {
//   if (params.user) {
    
//     let user = params.user
//     fetchedProfile.set(user)
//     return params
//   }
 
//   throw error(404, 'Not found');
// }

export async function load({ params }) {
  let input = params.user
  let user
  let res

  if (input.includes('.trx')) user = input
  else if (input == '*') user = 'nick.trx'
  else user = input + '.trx'
  // console.log(user)
  try {
      res = await fetch(getProfileURL + user)
      if (!res.ok) throw new Error('fetch Error, null fetch')
      let profile = await res.json()
      fetchedProfile.set(profile)
      return profile
  } catch (error) {
      console.log(error.message)
  }

  //throw error(404, 'Not found');
  
}