import React, {useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { Container, Table, Row, Col, Button } from 'react-bootstrap';
import HashLoader from "react-spinners/HashLoader";
import Loader from '../components/Loader';
import {Helmet} from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons';
import getRelativeTime from '../utility/relativeTime';
import queryString from 'query-string';

import Pagination from '../components/Pagination';
import Transaction from '../components/Transaction';

import fillRemainingRows from '../utility/remainingRows.js';

const Mempool = (props) => {
    let params = queryString.parse(props.location.search);
    let paramPage = params.page ? Math.round(parseInt(params.page)) : 1;

    const [page, setPage] = useState(paramPage ? paramPage : 1);
    const [pagination, setPagination] = useState({});
    const [transactions, setTransactions] = useState(undefined);
    const [isSyncing, setSyncing] = useState(false);
    const [status, setStatus] = useState(Date.now());

    const [myTx, setMyTx] = useState(undefined);

    const syncMyTx = () => {
        axios
          .get(`/api/mempool/tx/myTx`)
          .then(res => {
            console.log(res.data);
              setTimeout(()=>{
                setMyTx(res.data);
            }, 1000);
          })
          .catch(err => console.error(err));        
    }

    const syncMempool = (startLoader=true) => {
        if(startLoader)
            setTransactions(undefined);
        setSyncing(true);
        axios
          .get(`/api/mempool?page=${page}`)
          .then(res => {
              setTimeout(()=>{
                  setTransactions(res.data)
                  setSyncing(false);
                  let syncTime = new Date().toLocaleTimeString();
                  setStatus(syncTime.substring(0, syncTime.length-6) + syncTime.substring(syncTime.length-3));
                  setPagination({
                      maxPages: res.data.maxPages
                  });
            }, 1000);
          })
          .catch(err => console.error(err));        
    }

    useEffect(() => {
        props.history.push(`${props.location.pathname}?page=${page}`)
        syncMempool(true);
        syncMyTx();
        return ()=>{}
    },[page]);

    
    // Sync chain from daemon at interval of time {REACT_APP_SYNC_DURATION}
    useEffect(()=>{
        const syncInterval = setInterval(()=>{
            syncMempool(false);
            syncMyTx();
        }, process.env.REACT_APP_SYNC_DURATION || 30000);
        return ()=>{
            clearInterval(syncInterval);
        }
    }, []);


    return (
        <Container>
            <Helmet title={`Transaction pool`} />
            {
                transactions ?
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
                                Current Length of entire mempool: {transactions.length}
                            </Col>
                        </Row>
                        <br/>
                        
                        <Table striped bordered hover size="sm" responsive>
                            <thead>
                                <tr>
                                <th>ID / Hash</th>
                                <th>Amount</th>
                                <th>No. of Inputs</th>
                                <th>No. of Outputs</th>
                                <th>Fee</th>
                                <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    transactions.mempool.map(transaction => {
                                        return(
                                            <tr key={transaction.id}>
                                                <td>{transaction.id}</td>
                                                <td>{
                                                    transaction.outputs.reduce((prev, curr)=>prev.amount + curr.amount)
                                                }</td>
                                                <td>{transaction.inputs.length}</td>
                                                <td>{transaction.outputs.length}</td>
                                                <td>{transaction.fee}</td>
                                                <td>{getRelativeTime(transaction.timestamp)} </td> {""}
                                            </tr>
                                        )
                                    })
                                }
                                { fillRemainingRows(transactions.mempool.length, 6)}
                            </tbody>
                            </Table>
                        <Pagination page={page} setPage={setPage} pagination={pagination} />
                        <br/><br/>
                        <h4>Your pending transactions: </h4>
                        {
                            myTx ? 
                            myTx.map(tx => <Transaction tx={tx} />) 
                            : 
                            <Loader>
                                <HashLoader color={"#03a30b"} loading={true} size={150} />
                            </Loader>
                        }
                    </div> 
                    :
                    <Loader>
                        <HashLoader color={"#03a30b"} loading={true} size={150} />
                    </Loader>

            } 
        </Container>
    )
}


export default Mempool
