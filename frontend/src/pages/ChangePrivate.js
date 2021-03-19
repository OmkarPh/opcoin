import React, {useEffect, useState} from 'react'
import {Container, Row, Col, Button, Card, InputGroup, Form, FormControl} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';


import Loader from '../components/Loader';
import HashLoader from "react-spinners/HashLoader";


const ChangePrivateKey = () => {
    const [wallet, setWallet] = useState(undefined);
    const [hidden, setHidden] = useState(true);
    const [message, setMessage] = useState({success: true, text: ''});

    const [changingPrivateKey, setChangingPrivateKey] = useState(false);

    const [newKey, setNewKey] = useState('');
    const [consent, setConsent] = useState(false);

    function fetchDetails(){
        setWallet(undefined);
        axios
          .get("/api/wallet")
          .then(res => {
              setTimeout(()=>{
                setWallet(res.data);
              }, 1000)
          })
          .catch(err => console.error(err));
    }


    function changeKey(e){
        e.preventDefault();
    
        // Create transaction
        let newPrivateKey = newKey.toLowerCase();

        if(!/^[a-f0-9]{64}$/.test(newKey.toLowerCase()))
            return alert('Private key must be a 64 character long hex string consisting 0-9 and/or a-f (any case)')

        setChangingPrivateKey(true);
        axios
            .post("/api/wallet/changeKey", {
                pk: newPrivateKey
            })
            .then(res => {
                if(res.status == 200){
                    setMessage({success: true, text: res.data.message});
                    setConsent(false);
                    setNewKey('');
                    setChangingPrivateKey(false);
                    fetchDetails();
                }
                else{
                    setMessage({success: false, text: res.data.message});
                    setChangingPrivateKey(false);
                }
            })
            .catch(err => {
                if(err.response.status == 400)
                    setMessage({success: false, text: err.response.data.message});
                else
                    setMessage({success: false, text: 'Some error occured while changing the private key :('});
                setChangingPrivateKey(false);
            });
    }

    useEffect(()=>{
        fetchDetails();
    }, []);
    
    return (
        wallet ?
        <Container>
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
            <br />
            
            <Form onSubmit={changeKey}>
                <Form.Group controlId="newPrivate">
                    <Form.Label>Enter new secret private key:</Form.Label>
                    <Form.Control 
                        type="password"
                        placeholder="Something like 1d2a38c2ca2923f8a4e9d9e6eaf.....60 ( 64 hex digits )" 
                        value={newKey}
                        onChange={e => setNewKey(e.target.value)}    
                    />
                    {
                        !/^[a-f0-9]{64}$/.test(newKey.toLowerCase()) ? 
                        <span className='text-danger'>Private key must be a 64 character long hex string with characters 0-9 and/or a-f (any case)</span> : ""
                    }
                </Form.Group>

                <Form.Group controlId="consent">
                    <Form.Check 
                        type="checkbox" 
                        label="I consent." 
                        checked={consent}
                        onChange={()=>setConsent(val => !val)}
                        required={true}
                    />
                </Form.Group>

                <Button 
                    variant="primary"
                    type="submit" 
                    disabled={!/^[a-f0-9]{64}$/.test(newKey.toLowerCase()) || changingPrivateKey}
                >
                    {
                        changingPrivateKey ? 'Processing transaction .....' : 'Submit'
                    }
                </Button>

                <br/><br/>

                <span className={message.success ? 'text-success' : 'text-danger'}>
                    {message.text}
                </span>

                </Form>
            <br />

            </Container>
        :
        <Loader>
            <HashLoader color={"#0466cf"} loading={true} size={150} />
        </Loader>
    )
}

export default ChangePrivateKey
