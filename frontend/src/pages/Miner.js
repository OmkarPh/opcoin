import React, { useState, useEffect } from 'react'
import axios from 'axios';

import { Button, Container } from 'react-bootstrap'

const Miner = () => {
    const [status, setStatus] = useState("Click on Mine button above ^ to mine & contribute to OP-coin + Get assured Op-coin reward !");

    const [isMining, setMining] = useState(false);

    const mine = () =>{
        setMining(true);
        axios
        .post("/api/mineBlock")
        .then(res=>{
            setTimeout(
                ()=>{
                    console.log("Mined !");
                    console.log(res.data);
                    setStatus(res.data.message);
                    setMining(false);
                }, 2000
            )
            // console.log("Mined !");
            // console.log(res.data);
            // setStatus(res.data.message);
            // setMining(false);
        }).catch(err=>{
            console.log("Some problem occured while mining block !");
            setMining(false);
        })
    }

    
    
    return (
        <Container>
            <Button
                variant="primary"
                disabled={isMining}
                onClick={!isMining ? mine : null}
                >
                {isMining ? 'Mining......' : 'Mine a block'}
            </Button>
            <br/><br/>
            <span>{status}</span>
        </Container>
    )
}

export default Miner
