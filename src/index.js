// Node Core dependencies
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// GLobal dependencies
import express from 'express';
import localtunnel from 'localtunnel';
import slashes from 'connect-slashes';       // To remove or add trailing slash at end of request url




// Setup
import hasher from './utils/hash.js';


// Fetching constants
import { PORT, SUBDOMAIN, EXPOSE_GLOBALLY } from './CONSTANTS/index.js';




// Setting up the server
// const port = process.argv[2] || process.env.PORT || 5000;
const app = express();
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 
app.use(slashes(false));



app.listen(PORT, ()=> {
    console.log(`Server is up and running on port ${PORT}`);

    if(EXPOSE_GLOBALLY.includes('no'))
        return;

    // Globally exposing our Blockchain node
    const tunnel = localtunnel(PORT, { subdomain: SUBDOMAIN}, (err, tunnel) => {
        if(tunnel)
            console.log(`Node exposed globally: ${tunnel.url}`);
        if(err)
            console.log(`Some error occured during exposing node globally: `, err);
        // console.log(tunnel.opts);    // console.log(tunnel.tunnelCluster.opts);    // Debug statements

        // Bypass tactic:
        axios.get(`${tunnel.url}/responses/ping`, (res)=>console.log(res.data));
    });

    tunnel.on('close', ()=>{
        console.log(`Tunnel ${tunnel.url} listening to local port ${tunnel.tunnelCluster.opts.local_port} closed !`);
    });
});










// Routes

// Administration routes
import admin from './Routes/admin.js';
import blockchain from './Routes/blockchain.js';
import axios from 'axios';
app.use(admin);
app.use('/api', blockchain);









// Misc Pages

// Ping response for keeping site awake
app.get('/responses/ping', (req, res)=>{
    res.status(200).send('-- ok --');
});



// Serve react from build directory when in production
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('frontend/build'));
    app.get('*', (req, res)=>{
        res.sendFile(path.resolve(__dirname, '..','frontend', 'build', 'index.html'));
    });
}

// // Pushing 404 page from another route
// app.get('/404',(req,res)=>{
//     res.status(404).send("Page not found :(  <br> ¯\\_(ツ)_/¯");
// });

// // 404 page
// app.get('*', (req, res)=>{
//     res.redirect('/404');
// });
