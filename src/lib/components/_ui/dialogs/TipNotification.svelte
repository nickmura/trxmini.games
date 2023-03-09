<script lang='ts'>

import { slide} from 'svelte/transition';
import { connectedAddress, connectedUsername, notificationsUrl, playerNotifications, getBalance, tipSocket, medalAlert, authPrompt, postRequest } from '$lib/state/state';
import { io } from 'socket.io-client';



const socket = io(tipSocket)
let sender:String
let recipient
let tip:Number
let txid:string

let hasTipped = false // Checks if the event variable 'to' matches the $connectedAddress. If true, hasTipped = true
let hasSent = false // Checks if the event variable 'from' matches the $connectedAddress || $connectedUsername, If true = hasSent = true
socket.on('recievedTip', async (from, to, amount, tx) => {
    console.log(from, to, amount, tx)
    sender = from
    recipient = to
    tip = amount;
    txid = `https://shasta.tronscan.org/#/transaction/${tx}`

    if (to == $connectedAddress) {
        hasTipped = true
    }
    if (from == $connectedAddress && to != $connectedAddress|| from == $connectedUsername && to != $connectedUsername) {
        hasSent = true
        hasTipped = false
    }
    const userNotification = JSON.stringify({address: $connectedAddress, name: $connectedUsername})
    let test = await postRequest(notificationsUrl, userNotification)
    console.log(test)
    playerNotifications.set(test)
})

function seenNotification() {
    hasTipped = !hasTipped
}
function seenSentNotification() {
    hasSent = !hasSent
}

function openAuth() {
    authPrompt.set(!$authPrompt)
}
function medalAlertOff() {
    localStorage.setItem('hasSeenMedal', 'true')
    medalAlert.set(false)
}
</script>

<main>
    {#if hasTipped}
        <div class='fixed right-52 noti ' transition:slide>
            <div class='noti border border-blue-400 bg-blue-500 text-white dark:bg-blue-500 mt-8 rounded-lg px-3 py-3 flex justify-between
            hover:scale-[1.05] transition transition-200'>
                <img src='/img/noti.svg' alt='notification-alert' class='w-6 h-6 mr-2 animate-pulse'>
                <div class='text-sm mt-0.5'><a href={txid} target='_blank' rel='noreferrer'><u>You got a {tip} TRX tip from {sender}!</u></a> </div>
                <button on:click={seenNotification} class='hover:scale-[1.1] transition transition-200'>
                    <img src='/img/cancel.svg' alt='notification-alert' class='w-4 h-4 ml-2'>
                </button>
            </div>
        </div>
    {:else if hasSent}
        <div class='fixed right-52 noti ' transition:slide>
            <div class='noti border border-blue-400 bg-blue-500 text-white dark:bg-blue-500 mt-8 rounded-lg px-3 py-3 flex justify-between
            hover:scale-[1.05] transition transition-200'>
                <img src='/img/noti.svg' alt='notification-alert' class='w-6 h-6 mr-2 animate-pulse'>
                <div class='text-sm mt-0.5'><a href={txid} target='_blank' rel='noreferrer'><u>Transaction sent.</u></a> </div>
                <button on:click={seenSentNotification} class='hover:scale-[1.1] transition transition-200'>
                    <img src='/img/cancel.svg' alt='notification-alert' class='w-4 h-4 ml-2'>
                </button>
            </div>
        </div>
    {/if}
    {#if $medalAlert}
        <div class='fixed right-52 noti ' transition:slide>
            <div class='noti border border-blue-400 bg-blue-500 text-white dark:bg-blue-500 mt-8 rounded-lg px-3 py-3 flex justify-between
            hover:scale-[1.05] transition transition-200 '>
                <img src='/img/noti.svg' alt='notification-alert' class='w-6 h-6 mr-2 animate-pulse'>
                <div class='text-sm mt-0.5'><a href={txid} target='_blank' rel='noreferrer'><button class='text-underline' on:click={openAuth}><u>You got a medal</u></button> for participating and winning the 8 Ball Challenge! Congratulations!</a> </div>
                <button on:click={medalAlertOff} class='hover:scale-[1.1] transition transition-200'>
                    <img src='/img/cancel.svg' alt='notification-alert' class='w-4 h-4 ml-2'>
                </button>
            </div>
        </div>
    {/if}
</main>

<style>
    .noti {
        z-index: 999;
    }
</style>