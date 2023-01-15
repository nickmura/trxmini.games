//@ts-nocheck
// THIS IS SOLELY CONFIGURATION AND ENDPOINTS FOR FOR USERNAMES VIA POSTGRES
import express from 'express';
import crypto from 'crypto';
import B2 from 'backblaze-b2'
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

import { post } from './cred.js';
import { getLevel, B2AppKeyID, B2AppKey, postRequest } from './level.js';

const b2 = new B2({
    applicationKeyId:B2AppKeyID,
    applicationKey:B2AppKey,
})

post.connect();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const whitelist = ['https://test2.trxmini.games', '//test2.trxmini.games', 'http://trxmini.games', 
'http://www.trxmini.games', 'http://localhost:5173', '//localhost:5173', 'http://localhost:5500', 'http://172.105.106.183:3001', 'http://172.105.106.183:3001']
const config = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) callback(null, true)
        else callback(new Error(`CORS Policy denied, origin is unexpected origin ${origin}`))
    }
}
app.use(cors(config));

let rooms;

app.post('/address', async (req, res) => {
    let user = req.body;
    let insert = `insert into usernames("address", "games_played", "has_played", "games_won", "has_won_8ball", "xp", "is_beta") 
    values($1, $2, $3, $4, $5, $6, $7)`;
    
    const values = [`${user.address}`, 0, false, 0, false, 0, true];
    post.query(insert, values, (err, result) => {
        if (!err) console.log('Insertion was successful');
        if (err) console.log(err);
    })
})


app.post('/username',  async (req, res) => {
    let user = req.body
    console.log(user)
    let insert = `UPDATE usernames SET username = ($1) WHERE address = ($2)`;
    let insertDefault = `UPDATE usernames SET default_username = ($1) WHERE address = ($2)`
    const values = [`${user.name}.trx`, `${user.address}`]
    console.log(values)
    post.query(insert, values, (err, result) => {
        if (!err) console.log('Username insertion was successful')
        else console.log(err)
    })
    try {
        const insert_default_query = await post.query(insertDefault, values);
    } catch (err) { console.log(err) }
})

app.get('/username', async (req, res) => {
    let userAddress = req.query.addr
    let user 
    
    const select = `SELECT username,default_username,has_won_8ball,xp FROM usernames WHERE address = ($1)`
    const values = [`${userAddress}`]
    post.query(select, values, (err, result) => {
        //if (!err) user = {address: userAddress, username: result.rows[0]}
        if (!err) {
            console.log('Selected query', result.rows[0])
            if (result.rows[0] != undefined) user = {address: userAddress, username: result.rows[0].username, defaultusername: result.rows[0].default_username, xp: result.rows[0].xp, hasWon8Ball: result.rows[0].has_won_8ball}
            if (user) return res.json(user)
        }
        else console.log(err)
    })
})

app.get('/getaddr', async (req, res) => {
    let username = req.query.username
    let address
    const select = `SELECT address FROM usernames WHERE username = ($1)`
    const values = [`${username}`]
    post.query(select, values, (err, result) => {
        if (!err) {
            console.log('Selected query', result)
            if (result.rows != undefined) address = {address: result.rows[0].address, username: username}
            if (address) return res.json(address)
        } else console.log(err)
    })
})
app.post('/unique', async (req, res) => {
    let username = req.query.user
    console.log(username)

    const select = `SELECT COUNT(*) FROM usernames WHERE username = ($1)`
    const value = [`${username}`]

    post.query(select, value, (err, result) => {
        if (!err) {
            console.log('Selected query', result.rows[0].count)
            if (result.rows[0].count == 0) return res.json({unique: true}) 
            if (result.rows[0].count == 1) return res.json({unique: false}) 
        } else console.log(err)
    })
})


app.post('/gamewon8ball', async (req, res) => {
    let user = req.body
    let insert 
    let values
    if (!user.name) {
        insert = `UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true,has_won_8ball=true,xp=xp+1000,is_beta=true WHERE address=($1)`
        values = [`${user.address}`]
    } else {
        insert = `UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true,has_won_8ball=true,xp=xp+1000,is_beta=true WHERE username=($1)`
        values = [`${user.name}`]
    }
    post.query(insert, values, (err, result) => {
        if (!err) console.log('Game played & won set to player', user)
        else console.log(err)
    })
})

app.post('/gameplayed', async (req, res) => {
    let user = req.body
    let select
    
    let xp 

    let insert 
    let values

    let insertNotification
    let notification

    if (!user.name) {
        select = `SELECT xp FROM usernames WHERE address = ($1)`
        insert = `UPDATE usernames SET games_played=games_played+1,has_played=true,xp=xp+350 WHERE address=($1)`
        values = [`${user.address}`]
    } else {
        select = `SELECT xp FROM usernames WHERE username = ($1)`
        insert = `UPDATE usernames SET games_played=games_played+1,has_played=true,xp=xp+350 WHERE username=($1)`
        values = [`${user.name}`]
    }
    try {
        xp = await post.query(select, values)
        xp = xp.rows[0].xp
        console.log(xp)
    } catch (error) {
        console.log(error)
    }
    
    let lastLevel = getLevel(xp)
    let currentLevel = getLevel(xp+350)
    console.log(lastLevel, currentLevel)
    if (Math.floor(lastLevel) < Math.floor(currentLevel)) {
        console.log(lastLevel, currentLevel);
        let uuid = uuidv4()

        if (!user.name) {
            insertNotification = `INSERT into notifications("address","notification", "id") values($1, $2, $3)`;
            notification = [`${user.address}`, `You leveled up to level ${Math.floor(currentLevel)}!`, `${uuid}`];
        } else {
            insertNotification = `INSERT into notifications("username","notification", "id") values($1, $2, $3)`;
            notification = [`${user.name}`, `You leveled up to level ${Math.floor(currentLevel)}!`, `${uuid}`];
        } try {
            await post.query(insertNotification, notification)
            console.log('Created notification for level up')
        } catch(error) {
            console.log('insertNotification error', error)
        }    
    }


    try {
        await post.query(insert, values);
        console.log('Game played set to player', user)
    } catch (error) {
        console.log(error);
    }
    return res.json({success: true})

})

app.post('/gamewon', async (req, res) => {
    let user = req.body
    let insert 
    let values
    if (!user.name) {
        insert = `UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true,xp=xp+1000 WHERE address=($1)`
        values = [`${user.address}`]
    } else {
        insert = `UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true,xp=xp+1000 WHERE username=($1)`
        values = [`${user.name}`]
    }
    post.query(insert, values, (err, result) => {
        if (!err) console.log('Game played & won set to player', user)
        else console.log(err)
    })
    return res.json({success: 'gameWon'})
})

app.get('/getxp', async (req, res) => {
    let user = req.query.user
    let insert = `SELECT xp FROM usernames WHERE username = ($1)`
    let values = [`${user}`]

    post.query(insert, values, (err, result) => {
        if (!err) {
            console.log(`Select xp from user ${user}`)
            return res.json({user: user, xp: result.rows[0].xp})
        
        }
        if (err) console.log(err)
    })

})

app.post('/getnotifications', async (req, res) => {
    let user = req.body
    let select = `SELECT notification,id FROM notifications WHERE address = ($1) OR username = ($2)`
    let values = [`${user.address}`, `${user.name}`]
    let query 

    try {
        query = await post.query(select,values)
    } catch (error) {
        console.log(error)
    } return res.json(query.rows)
})

app.post('/deletenotification', async (req, res) => {
    let notification = req.body
    const deleteQuery = 'DELETE FROM notifications WHERE id = ($1)'
    const values = [`${notification.id}`]
    let query
    try {
        query = await post.query(deleteQuery, values);
        console.log('Deleted notification', notification.id)
    } catch (error) { console.log(error) } 
})

app.post('/tipnotification', async (req, res) => {
    let tip = req.body
    let uuid = uuidv4();
    let noti = `<a href='https://shasta.tronscan.org/#/transaction/${tip.txid}' target='_blank' rel='noreferrer'><u>You have recieved a tip from ${tip.sender} for ${tip.amount} TRX!</u></a>` // Should be changed to include the token.
    let query

    const insert = `INSERT into notifications("address", "notification", "id") values($1, $2, $3)`
    const values = [`${tip.recipient}`, `${noti}`, `${uuid}`]

    try {
        query = await post.query(insert, values)
        console.log('Success insertion', tip.recipient)
    } catch (error) {
        console.log(error)
    }
    return res.json(console.log({success: tip.recipient}))
})

app.post('/chessnotification', async (req, res) => {
    let wager = req.body
    let uuid = uuidv4();
    let noti = `<a href='https://shasta.tronscan.org/#/transaction/${wager.txid}' target='_blank' rel='noreferrer'><u>You won a chess game wager against ${wager.opponent} for ${wager.amount} TRX!</u></a>`
    let query

    let insert
    let values

    
    if (wager.address) {
        insert = `INSERT into notifications("address", "notification", "id") values($1, $2, $3)`
        values = [`${wager.address}`, `${noti}`,`${uuid}`]
    } else {
        insert = `INSERT into notifications("username", "notification", "id") values($1, $2, $3)`
        values = [`${wager.winner}`, `${noti}`,`${uuid}`]
    }

    try {
        query = await post.query(insert, values)
        console.log('Success wager insertion', wager.winner)
    } catch (error) {
        console.log(error)
    }
    return res.json({success: wager.txid})
})
app.get('/getprofile', async(req, res) => {
    let user = req.query.user

    // Make this fetch by address. -->  
    let insert = `SELECT address,username,default_username,img,has_played,games_played,games_won,has_won_8ball,xp,is_beta,description 
    FROM usernames WHERE username = ($1) OR default_username = ($1) OR previous_username = ($1)`
    let values = [`${user}`]

    let query

    try { 
        query = await post.query(insert, values);
        
    } catch (error) {
        console.log(error);
    }
    console.log('Successfully fetched profile information', query.rows[0])
    return res.json(query.rows[0]);
})


app.post('/uploadavatar', multer({storage: multer.memoryStorage()}).single("avatar"), async (req, res, next) => {
    let user = req.query.user
    console.log('$connectedUsername', user)
    if (req.file) {

        //console.log('req.file', req.file)
        let uploadUrl
        let uploadAuthToken
        let imageUploadResponse
        async function authenticate() {
            let auth = await b2.authorize();
            let uploadUrlRequest = await b2.getUploadUrl({
                bucketId: 'dd6eb222a9a75ebb88550a10'
            });
            // console.log(uploadUrlRequest)
            // console.log('uploadUrl.data', uploadUrlRequest.data)
            uploadUrl = uploadUrlRequest.data.uploadUrl
            uploadAuthToken = uploadUrlRequest.data.authorizationToken
            console.log(uploadUrl)

        } await authenticate()
        async function imageUpload(mime, originalName, buffer) {
            let uuid = Math.floor(Math.random()*10000000)
            let upload = b2.uploadFile({
                uploadUrl: uploadUrl,
                uploadAuthToken: uploadAuthToken,
                fileName: mime.includes('jpeg') && originalName.includes('jpg') ? `image-${uuid}.jpg` : mime.includes('jpeg') && originalName.includes('jpeg') ? `image-${uuid}.jpeg` : `image-${uuid}.png`,
                mime: mime, 
                data: buffer
            })
            imageUploadResponse = await upload
            console.log('Successful image upload')

        } await imageUpload(req.file.mimetype, req.file.originalname, req.file.buffer);

        let imageName = imageUploadResponse.data.fileName
        let imageUrl = `https://f004.backblazeb2.com/file/trxmini-games-/${imageName}`

        // SQL insertion

        let insertImgUrl = `UPDATE usernames SET img = ($1) WHERE username = ($2)`
        let values = [`${imageUrl}`, `${user}`]
        try {
            let updateImageUsernames = await post.query(insertImgUrl, values);
            console.log('Successfully added avatarimage to user row');
        } catch (error) {
            console.log(error);
        }
        
        console.log(imageUploadResponse)
        console.log(imageName)
    }

})

app.get('/getavatar', async (req, res) => {
    let user = req.query.user
    let imageUrl
    let counter = 0
    let hasAvatar = false
    let selectQuery 
    async function fetchAvatar() {
        while (counter < 1000 && !hasAvatar) {
            counter++;
            try {
                let SELECT = `SELECT img FROM usernames WHERE username = ($1)`
                let values = [`${user}`]
                selectQuery = await post.query(SELECT, values);
                hasAvatar = true
            } catch (error) {
                console.log(error);
            }
        } return res.json(selectQuery.rows[0].img)
    }   
    setTimeout(fetchAvatar, 3000)
})

app.post('/changeusername', async (req, res) => {
    let user = req.body

    let insertPrevious = `UPDATE usernames SET previous_username=username WHERE address=($1)`;
    let value = [`${user.address}`];
    
    let insert = `UPDATE usernames SET username=($1) WHERE address=($2)`;
    let values = [`${user.name}`, `${user.address}`];
    
    try {
        await post.query(insertPrevious, value);
        await post.query(insert, values);
        console.log('Successfuly changed username to', user.name)

    } catch (error) {
        
        console.log(error)
    }
    
})



console.log('Listening on port 5001')
app.listen(5001)
