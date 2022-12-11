import { error } from '@sveltejs/kit';
import { getProfileURL, isProfile, fetchedProfile } from '$lib/state/state'


/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  let user
  
  if (params.user.includes('.trx')) user = params.user
  else user = params.user + '.trx'
  console.log(user)
  const res = await fetch(getProfileURL + user)
  if (!res.ok) throw new Error('fetch Error, null fetch')
  let profile = await res.json()
  fetchedProfile.set(profile)

  if (profile) {
    return profile
  }
 
  throw error(404, 'Not found');
}