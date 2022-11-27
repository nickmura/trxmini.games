<script>
//@ts-nocheck
import { slide} from 'svelte/transition'
import { connectedAddress, connectedUsername, getBalance, tipSocket } from '$lib/state/state'
import { io } from 'socket.io-client'

const socket = io(tipSocket)
let sender
let recipient
let tip
let txid

let hasTipped = false // Checks if the event variable 'to' matches the $connectedAddress. If true, hasTipped = true
let hasSent = false // Checks if the event variable 'from' matches the $connectedAddress || $connectedUsername, If true = hasSent = true
socket.on('recievedTip', (from, to, amount, tx) => {
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
})

function seenNotification() {
    hasTipped = !hasTipped
}
function seenSentNotification() {
    hasSent = !hasSent
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
</main>

<style>
    .noti {
        z-index: 999;
    }
</style>