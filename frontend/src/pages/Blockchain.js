import React, {useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { Container, Card, ListGroup, Table, Row, Col, Button } from 'react-bootstrap';
import { MDBBtn } from 'mdbreact';
import HashLoader from "react-spinners/HashLoader";
import Loader from '../components/Loader';

import getRelativeTime from '../utility/relativeTime';

const Blockchain = () => {
    const [blockchain, setBlockchain] = useState(undefined);
    const [isSyncing, setSyncing] = useState(false);
    const [status, setStatus] = useState(Date.now());

    const syncChain = () => {
        setSyncing(true);
        axios
          .get("/api/blockchain")
          .then(res => {
              setTimeout(()=>setBlockchain(res.data.chain), 500);
              setSyncing(false);
              setStatus(new Date().toLocaleTimeString());
          })
          .catch(err => console.error(err));        
    }

    useEffect(() => {
        syncChain();
        return ()=>{}
    },[]);

    return (
        <Container>
            {
                blockchain ?
                    <div>
                        <Row>
                            <Col sm="6"></Col>
                            <Col>
                                <Button
                                variant="primary"
                                disabled={isSyncing}
                                onClick={!isSyncing ? syncChain.bind(true) : null}
                                >
                                {isSyncing ? 'Sync in progress....' : 'Sync blockchain'}
                            </Button>
                            </Col>
                            <Col><span>Blockchain synced at {status}</span></Col>
                        </Row>
                        <Row>
                            Current Length of blockchain: {blockchain.length}
                        </Row>
                        {'   '}
                        
                        <Table striped bordered hover size="sm" responsive>
                            <thead>
                                <tr>
                                <th>#</th>
                                <th>Hash</th>
                                <th>Transactions</th>
                                <th>Timestamps</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    blockchain.map(block => {
                                        return(
                                            <tr key={block.hash}>
                                                <td>{block.number}</td>
                                                <td>{block.hash}</td>
                                                <td>{block.transactions.length}</td>
                                                <td>{block.timestamp}  {getRelativeTime(block.timestamp)} </td> {""}
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                            </Table>

                    </div> : <Loader>
                        <HashLoader color={"#0411E0"} loading={true} size={150} />
                    </Loader>

            } 
            {/* {
                blockchain ? "Got it" : "Loading....."
            }
            <div>
                Blockchain here !
            </div> */}
        </Container>
    )
}

export default Blockchain
