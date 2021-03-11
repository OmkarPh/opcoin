import React, {useEffect, useState, useRef} from 'react'
import {Container, Row, Col, Button, Form} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';


import Loader from '../components/Loader';
import HashLoader from "react-spinners/HashLoader";


const Wallet = () => {
    const [wallet, setWallet] = useState(undefined);
    const [hidden, setHidden] = useState(true);
    const [isSyncing, setSyncing] = useState(true);

    function fetchDetails(){
        setSyncing(true);
        axios
          .get("/api/wallet")
          .then(res => {
              setTimeout(()=>{
                console.log(res.data);
                setSyncing(false);
                setWallet(res.data);  
              }, 1000)
          })
          .catch(err => console.error(err));
    }

    useEffect(()=>{
        fetchDetails();
    }, []);

    return (
        wallet ?
        <Container>
            <Button
                variant="primary"
                className="mb-3"
                disabled={isSyncing}
                onClick={!isSyncing ? ()=>fetchDetails() : null}
            >
                {isSyncing ? 'Sync in progress .....' : 'Sync'}
            </Button>
            <Row sm={12} md={6} lg={4}>
                <Col xs={6}>
                    <h5>Your balance:</h5>
                </Col>
                <Col>
                    <h5>{wallet.balance} OPs</h5>
                </Col>
            </Row>
            <Row sm={12} md={6} lg={4} className="mt-3">
                <Col xs={6}>
                    <h5>Balance after transactions are mined:</h5>
                </Col>
                <Col>
                    <h5>{wallet.postTxBalance} OPs</h5>
                </Col>
            </Row>

            <Row sm={12} className="mt-3">
                <Col xs={3}>
                    <h5>Your secret private key:</h5>
                </Col>
                <Col>
                    <input
                        className="b-0 font-small"
                        style={{width:'710px'}}
                        type={hidden ? 'password' : 'text'} 
                        value={wallet.privateKey} 
                        disabled/>
                    <Button
                        variant={hidden ? 'outline-danger' : "outline-primary"}
                        onClick={e => setHidden(prev => !prev)}
                    >
                        {hidden ? 'Show' : 'Hide'}
                    </Button>
                    <Button onClick={()=>window && window.navigator.clipboard.writeText(wallet.privateKey)}>
                        <FontAwesomeIcon icon={faCopy} />
                    </Button>
                </Col>
            </Row>

            <Row sm={12} className="mt-3">
                <Col>
                    <h5>Your Public key:</h5>
                    <p>{wallet.publicKey}</p>
                    Share this in order to receive OP coins !
                    <Button 
                        className="ml-3"
                        onClick={()=>window && window.navigator.clipboard.writeText(wallet.publicKey)}
                    >
                        <FontAwesomeIcon icon={faCopy} />
                    </Button>
                </Col>
            </Row>
            
            
            </Container>
        :
        <Loader>
            <HashLoader color={"#0466cf"} loading={true} size={150} />
        </Loader>
    )
}

export default Wallet
