import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';

import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import Loader from '../components/Loader';
import HashLoader from "react-spinners/HashLoader";


const Wallet = () => {
    const [wallet, setWallet] = useState(undefined);
    const [utxos, setUtxos] = useState(undefined);
    const [hidden, setHidden] = useState(true);
    const [message, setMessage] = useState({success: true, text: ''});

    const [isSyncing, setSyncing] = useState(true);
    const [creatingTx, setCreatingTx] = useState(false);

    const [sendAmount, setSendAmount] = useState(0);
    const [receiver, setReceiver] = useState('');
    const [consent, setConsent] = useState(false);

    function fetchDetails(){
        setSyncing(true);
        axios
          .get("/api/wallet")
          .then(res => {
              setTimeout(()=>{
                setSyncing(false);
                setWallet(res.data);  
              }, 1000)
          })
          .catch( err => console.error(err) );
    }

    function fetchUtxos(){
        axios
          .get("/api/wallet/utxo")
          .then(res => {
              setTimeout(()=>{
                setUtxos(res.data);
            })
          })
          .catch( err => console.error(err) );
    }

    function sendOpcoins(e){
        e.preventDefault();
        
        if(/^[a-f0-9]{130}$/.test(receiver.toLowerCase())){
            // Create transaction
            let receiverPublicKey = receiver.toLowerCase();

            setCreatingTx(true);
            axios
              .post("/api/wallet/newTransaction", {
                receiverPublicKey,
                amount: sendAmount
              })
              .then(res => {
                  console.log(res);
                  console.log(res.status);
                  if(res.status == 200){
                    setMessage({success: true, text: res.data.message});
                    setConsent(false);
                    setReceiver('');
                    setCreatingTx(false);
                    setSendAmount(0);
                    fetchDetails();
                    fetchUtxos();
                  }
                  else{
                    setMessage({success: false, text: res.data.message});
                    setCreatingTx(false);
                  }
              })
              .catch(err => {
                if(err.response.status == 406)
                    setMessage({success: false, text: err.response.data.message});
                else
                    setMessage({success: false, text: 'Some error occured while adding the transaction :('});
                setCreatingTx(false);
              });
        }else{
            alert('Invalid receiver public key !');
        }
    }

    useEffect(()=>{
        fetchDetails();
        fetchUtxos();
    }, []);
    
    return (
        wallet ?
        <Container>
            <Button
                variant="primary"
                className="mb-3"
                disabled={isSyncing}
                onClick={!isSyncing ? ()=>{
                    fetchDetails();
                    fetchUtxos();
                } : null}
            >
                {isSyncing ? 'Sync in progress .....' : 'Sync'}
            </Button>
            <Link className="float-right" target="_blank" to="/transactions/myTx">
                My transactions &nbsp; <FontAwesomeIcon icon={faExternalLinkAlt} />
            </Link>
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

            <Row>
                <Col>
                    <Link 
                        to="/keyChange" 
                        className="pt-2 d-block"
                        style={{color:'red', width: 'fit-content'}}
                    >
                        Change Private key?
                    </Link>
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
            
            <h4 className="mt-5">
                Unspent transaction outputs (UTXOs):
            </h4>
            {
                utxos ?
                <div className="">
                    {
                        utxos.map(utxo => {
                            return (
                                <Card className="m-3 p-2 w-responsive d-inline-block" key={utxo[0]}>
                                    {utxo[1].amount} OPcoins
                                </Card>
                            )
                        })
                    }
                </div>
                : 
                <Loader>
                    <HashLoader color={"#23c240"} loading={true} size={150} />
                </Loader>
            }

            <h4 className="mt-5">
                Send OP coins
            </h4>
            <Form onSubmit={sendOpcoins}>
                <Form.Group controlId="receiver">
                    <Form.Label>Receiver's public key:</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Something like 04a38c2ca2923f8a4e9d9e6eaf.....60 ( 130 hex digits )" 
                        value={receiver}
                        onChange={e => setReceiver(e.target.value)}    
                    />
                    {
                        !/^[a-f0-9]{130}$/.test(receiver.toLowerCase()) ? 
                        <span className='text-danger'>Public key must be a 130 character string with characters 0-9 and/or a-f (any case)</span> : ""
                    }
                </Form.Group>

                <Form.Group controlId="amount">
                    <Form.Label>Amount to send:</Form.Label>
                    <Form.Control
                        type="number"
                        value={sendAmount}
                        onChange={e => setSendAmount(e.target.value)}
                     />
                </Form.Group>

                <Form.Group controlId="consent">
                    <Form.Check 
                        type="checkbox" 
                        label="I consent. " 
                        checked={consent}
                        onChange={()=>setConsent(val => !val)}
                        required={true}
                    />
                </Form.Group>

                <Button 
                    variant="primary"
                    type="submit" 
                    disabled={!/^[a-f0-9]{130}$/.test(receiver.toLowerCase()) || creatingTx}
                >
                    {
                        creatingTx ? 'Processing transaction .....' : 'Submit'
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

export default Wallet
