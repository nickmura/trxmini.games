<script>
    //@ts-nocheck
    import { connectedAddress, trxDomainContract, getDomainsURL } from '$lib/state/state'

    const myAddress = $connectedAddress

    let domain
    let domains


    async function getDomain(address) {
        console.log(address)
        console.log(window.tronWeb)
        const contract = await window.tronWeb.contract().at(window.tronWeb.address.toHex(trxDomainContract));
        try {
            const defaultDomain = await contract.reverseOf(address).call();
            console.log(defaultDomain)
            return defaultDomain
        } catch (error) { console.log(error) }
    }



    // async function getDomains(address) {
    //     const contract = await window.tronWeb.contract().at(window.tronWeb.address.toHex(window.tronWeb.address.toHex(trxDomainContract)));
    //     let getDomain

    //     try {
    //         let balance = await contract.balanceOf(address).call();
    //         for (let i = 0; i < balance; i++) {
    //             const tokenId = await contract.tokenOfOwnerByIndex(address, i).call();
    //             try {
    //                 domain = await contract._tokenURIs(tokenId).call();
    //                 if (!domains.includes(domain)) domains.push(domain)
                    
    //                 console.log(domains)
    //             } catch (err) { 
    //                 console.log(err) 
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    async function getDomains(address) {
        let url = getDomainsURL + address + `&network=mainnet`
        const res = await fetch(url)
        if (!res.ok) throw new Error (res.status)
        domains = await res.json()
        
    }


    // console.log('domain', domain)
    // console.log('domain', domains)
</script>

<button class='rounded-full bg-white/40 px-5 py-2 text-white' on:click={(e)=>getDomain('TBRAnG7db7YNc3RYAgknFCtVgYQtGz7a9i')}>Get Domain</button>
<button class='rounded-full bg-white/40 px-5 py-2 text-indigo-600' on:click={(e)=>getDomains('TBRAnG7db7YNc3RYAgknFCtVgYQtGz7a9i')}>Get Domains</button>