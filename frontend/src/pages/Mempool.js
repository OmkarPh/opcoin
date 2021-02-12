import React, {useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { Container, Card, ListGroup, Table, Row, Col, Button } from 'react-bootstrap';
import HashLoader from "react-spinners/HashLoader";
import Loader from '../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons';
import getRelativeTime from '../utility/relativeTime';

const Mempool = () => {
    const [mempool, setmempool] = useState(undefined);
    const [isSyncing, setSyncing] = useState(false);
    const [status, setStatus] = useState(Date.now());

    const syncMempool = () => {
        setSyncing(true);
        axios
          .get("/api/mempool")
          .then(res => {
              setTimeout(()=>{
                  setmempool(res.data.mempool)
                  setSyncing(false);
                  let syncTime = new Date().toLocaleTimeString();
                  setStatus(syncTime.substring(0, syncTime.length-6) + syncTime.substring(syncTime.length-3));

                }, 1000);
          })
          .catch(err => console.error(err));        
    }

    useEffect(() => {
        syncMempool();
        return ()=>{}
    },[]);

    return (
        <Container>
            {
                mempool ?
                    <div>
                        <Row>
                            <Col md="6" lg="3"><span>Last synced at {status}</span></Col>
                            <Col md="0" lg="6" ></Col>
                            <Col sm="8" md="6" lg="3">
                                <Button
                                variant="primary"
                                disabled={isSyncing}
                                onClick={!isSyncing ? syncMempool : null}
                                >
                                { isSyncing ?'Sync in progress ':'Sync mempool' }
                                &nbsp;&nbsp;
                                <FontAwesomeIcon icon={faSync} className={`${isSyncing?'fa-spin':''}`} />
                            </Button>
                            </Col>
                        </Row>
                        <span className="visible-xs-inline"><br/></span>
                        <Row className="mb-12">
                            <Col md="4">
                                Current Length of mempool: {mempool.length}
                            </Col>
                        </Row>
                        <br/>
                        
                        <Table striped bordered hover size="sm" responsive>
                            <thead>
                                <tr>
                                <th>Sender</th>
                                <th>Receiver</th>
                                <th>Amount</th>
                                <th>Fee</th>
                                <th>Transacted</th>
                                <th>id</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    mempool.map(transaction => {
                                        return(
                                            <tr key={transaction.id}>
                                                <td>{transaction.sender}</td>
                                                <td>{transaction.receiver}</td>
                                                <td>{transaction.amount}</td>
                                                <td>{transaction.fee}</td>
                                                <td>{getRelativeTime(transaction.timestamp)} </td> {""}
                                                <td className="fa-ellipsis-h" >{transaction.id}</td>
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
        </Container>
    )
}


export default Mempool
