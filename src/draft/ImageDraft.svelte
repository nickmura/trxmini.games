<script>

async function authenticate() {
    const authenticateUrl = 'http://170.187.182.220:5001/authenticate'
    let idAndKey = 'de2297eb85a0:0043437c2551f4118c0dc56b70dbd2485b03b942ef'
    //let authString = 'Basic ' + Buffer.from(idAndKey).toString('base64');
    
    const res = await fetch(authenticateUrl)
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
    let response = await res.json()
    console.log(response)
    
}
</script>
<button on:click={authenticate}>Authentication test</button>