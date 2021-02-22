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

import fillRemainingRows from '../utility/remainingRows.js';

const Blockchain = (props) => {

    let params = queryString.parse(props.location.search);
    let paramPage = params.page ? Math.round(parseInt(params.page)) : 1;

    const [page, setPage] = useState(paramPage ? paramPage : 1);
    const [pagination, setPagination] = useState({});
    const [blockchain, setBlockchain] = useState(undefined);
    const [isSyncing, setSyncing] = useState(false);
    const [status, setStatus] = useState(Date.now());

    const syncChain = (startLoader=true) => {
        if(startLoader)
            setBlockchain(undefined);
        setSyncing(true);
        axios
          .get(`/api/blockchain?page=${page}`)
          .then(res => {
              setTimeout(()=>{
                  setBlockchain(res.data)
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
        syncChain(true);
        return ()=>{}
    },[page]);
    

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
                                onClick={!isSyncing ? ()=>syncChain(false) : null}
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
                                    blockchain.chain.map(block => {
                                        return(
                                            <tr key={block.hash}>
                                                <td>{block.number}</td>
                                                <td>{block.transactions.length}</td>
                                                <td>{getRelativeTime(block.timestamp)}</td>
                                                <td className="fa-ellipsis-h" >{block.hash}</td>
                                            </tr>
                                        )
                                    })
                                }
                                { 
                                    fillRemainingRows(blockchain.chain.length)
                                }
                            </tbody>
                            </Table>
                            <Pagination page={page} setPage={setPage} pagination={pagination} />
                    </div> 
                    : 
                    <Loader>
                        <HashLoader color={"#0466cf"} loading={true} size={150} />
                    </Loader>

            } 
        </Container>
    )
}

export default Blockchain
