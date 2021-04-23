import React, {useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom';
import {Helmet} from 'react-helmet';
import axios from 'axios';

import getRelativeTime from '../utility/relativeTime';
import queryString from 'query-string';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons';

import { Container, Table, Row, Col, Button } from 'react-bootstrap';
import HashLoader from "react-spinners/HashLoader";

import Loader from '../components/Loader';
import fillRemainingRows from '../utility/remainingRows';
import Pagination from '../components/Pagination';
import TableWrapper from './blockchain.styled';

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
    

    // Sync chain from daemon at interval of time {REACT_APP_SYNC_DURATION}
    useEffect(()=>{
        const syncInterval = setInterval(()=>{
            syncChain(false);
        }, process.env.REACT_APP_SYNC_DURATION || 30000);

        return ()=>{
            clearInterval(syncInterval);
        }
    }, []);

    return (
        <Container>
            <Helmet title={`Blockchain explorer`} />
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
                                { isSyncing ? 'Sync in progress ' : 'Sync Blockchain' }
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
                        
                        <TableWrapper>
                            <Table striped={true} bordered hover size="sm" responsive>
                                <thead>
                                    <tr>
                                    <th>#</th>
                                    <th>Transactions</th>
                                    <th>Mined</th>
                                    <th>Hash</th>
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                    {
                                        blockchain.chain.map(block => {
                                            return(
                                                <tr key={block.hash}>
                                                    <td>
                                                        <Link to={`block/${block.height}`}>
                                                            {block.height}
                                                        </Link>
                                                    </td>
                                                    <td>{block.transactions.length}</td>
                                                    <td>{getRelativeTime(block.timestamp)}</td>
                                                    <td className="fa-ellipsis-h hashCol md-col-4 text-left" >
                                                        {
                                                            window && window.innerWidth <= 767 ?
                                                            block.hash.substr(0, 18) + "..."
                                                            : block.hash
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    { 
                                        fillRemainingRows(blockchain.chain.length)
                                    }
                                </tbody>
                                </Table>
                            </TableWrapper>
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