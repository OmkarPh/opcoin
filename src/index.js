// Node Core dependencies


// GLobal dependencies
import express from 'express';
import slashes from 'connect-slashes';       // To remove or add trailing slash at end of request url
if(!process.env.PORT){
    const dotenv = await import('dotenv');
    dotenv.config();
}


// Paths and URLs



// Setup
import hasher from './utils/hash.js';







// Setting up the server
const port = process.env.PORT || 3000
const app = express();
app.listen(port, ()=> console.log("Server is up and running on port "+port))
app.use(slashes(false));











// Site Home
app.get("/", (req, res) => {
    res.send("This is home page of my blockchain.");
 });
 



// Routes

// Administration routes
import admin from './Routes/admin.js';
import blockchain from './Routes/blockchain.js';
app.use(admin, blockchain);









// Misc Pages

// Ping response for keeping site awake
app.get('/responses/ping', (req, res)=>{
    res.status(200).send('-- ok --');
});

// Pushing 404 page from another route
app.get('/404',(req,res)=>{
    res.status(404).send("Page not found :(  <br> ¯\\_(ツ)_/¯");
})

// 404 page
app.get('*', (req, res)=>{
    res.redirect('/404');
});