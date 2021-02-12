import React, {useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { Container, Card, ListGroup, Table, Row, Col, Button } from 'react-bootstrap';
import HashLoader from "react-spinners/HashLoader";
import Loader from '../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons';
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
              setTimeout(()=>{
                  setBlockchain(res.data.chain)
                  setSyncing(false);
                  let syncTime = new Date().toLocaleTimeString();
                  setStatus(syncTime.substring(0, syncTime.length-6) + syncTime.substring(syncTime.length-3));
                    console.log(res.data.chain[0]);
                    console.log(JSON.stringify(res.data.chain[0]));

                }, 1000);
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
                            <Col md="6" lg="3"><span>Last synced at {status}</span></Col>
                            <Col md="0" lg="6" ></Col>
                            <Col sm="8" md="6" lg="3">
                                <Button
                                variant="primary"
                                disabled={isSyncing}
                                onClick={!isSyncing ? syncChain : null}
                                >
                                { isSyncing ?'Sync in progress ':'Sync Blockchain' }
                                &nbsp;&nbsp;
                                <FontAwesomeIcon icon={faSync} className={`${isSyncing?'fa-spin':''}`} />
                            </Button>
                            </Col>
                        </Row>
                        <span className="visible-xs-inline"><br/></span>
                        <Row className="mb-12">
                            <Col md="4">
                                Current Length of blockchain: {blockchain.length}
                            </Col>
                        </Row>
                        <br/>
                        
                        <Table striped bordered hover size="sm" responsive>
                            <thead>
                                <tr>
                                <th>#</th>
                                <th>Transactions</th>
                                <th>Mined</th>
                                <th>Hash</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    blockchain.map(block => {
                                        return(
                                            <tr key={block.hash}>
                                                <td>{block.number}</td>
                                                <td>{block.transactions.length}</td>
                                                <td>{getRelativeTime(block.timestamp)} </td> {""}
                                                <td className="fa-ellipsis-h" >{block.hash}</td>
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
