import React, {useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { Container, Table, Row, Col, Button } from 'react-bootstrap';
import HashLoader from "react-spinners/HashLoader";
import Loader from '../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons';
import getRelativeTime from '../utility/relativeTime';
import queryString from 'query-string';

import Pagination from '../components/Pagination';

const fillRemainingRows = (actualLength) => {
    const remainingRows = [];
    if(actualLength < process.env.REACT_APP_ENTRIES_PER_PAGE){
        for(let i=0; i<(process.env.REACT_APP_ENTRIES_PER_PAGE - actualLength); i++){
            console.log(i)
            remainingRows.push(
                <tr key={i}>
                    <td>{<br/>}</td>
                    <td>{}</td>
                    <td>{}</td>
                    <td>{}</td>
                    <td>{} </td> {""}
                    <td className="fa-ellipsis-h">{}</td>
                </tr>
            );
        }
    }
    // console.log(process.env.REACT_APP_ENTRIES_PER_PAGE -)
    console.log(process.env.REACT_APP_ENTRIES_PER_PAGE - actualLength, remainingRows);
    return remainingRows;
}

const Mempool = (props) => {
    let params = queryString.parse(props.location.search);
    let paramPage = params.page ? Math.round(parseInt(params.page)) : 1;

    const [page, setPage] = useState(paramPage ? paramPage : 1);
    const [pagination, setPagination] = useState({});
    const [transactions, setTransactions] = useState(undefined);
    const [isSyncing, setSyncing] = useState(false);
    const [status, setStatus] = useState(Date.now());

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
        return ()=>{}
    },[page]);



    return (
        <Container>
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
                                    transactions.mempool.map(transaction => {
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
                                { fillRemainingRows(transactions.mempool.length)}
                            </tbody>
                            </Table>
                            <Pagination page={page} setPage={setPage} pagination={pagination} />
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
