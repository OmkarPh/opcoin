import React, { useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faHammer } from '@fortawesome/free-solid-svg-icons';

const Miner = () => {
    const [status, setStatus] = useState("Click on Mine button above ^ to mine & contribute to OP-coin + Get assured Op-coin reward !");

    const [isMining, setMining] = useState(false);

    const mine = () =>{
        setMining(true);
        axios
        .post("/api/mineBlock")
        .then(res=>{
            setTimeout(()=>{
                setStatus(res.data.message);
                setMining(false);
            }, 1500);
        }).catch(err=>{
            console.log(err)
            setMining(false);
            setStatus('Some problem occured while communicating to servers');
        })
    }
  
    
    return (
        <Container>
            <Button
                variant="primary"
                disabled={isMining}
                onClick={!isMining ? mine : null}
                >
                { isMining ? 'Mining...' : 'Mine a block' }
                &nbsp;&nbsp;
                <FontAwesomeIcon icon={isMining?faCog:faHammer} className={`${isMining?'fa-spin':''}`} />
            </Button>
            <br/><br/>
            <span>{status}</span>
        </Container>
    )
}

export default Miner
