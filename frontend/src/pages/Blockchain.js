import React, {useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { Container, Card, ListGroup, Table, Row, Col, Button, Pagination } from 'react-bootstrap';
import HashLoader from "react-spinners/HashLoader";
import Loader from '../components/Loader';
import { Link } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons';
import getRelativeTime from '../utility/relativeTime';
import queryString from 'query-string';

const paginationItems = (activePage, maxPages, setPage)=>{
    const items = [];
    for(let page=activePage-2; page<activePage+5; page++){
        if(page > 1 && page < maxPages-1)
            items.push(
                <Pagination.Item
                    active={activePage === page}
                    onClick={()=>setPage(page)} 
                    key={page}> 
                    {page}
                </Pagination.Item>
            );
    }
    return items;
}

const Blockchain = (props) => {

    let params = queryString.parse(props.location.search);
    let paramPage = params.page ? Math.round(parseInt(params.page)) : 1;

    const [page, setPage] = useState(paramPage ? paramPage : 1);
    const [pagination, setPagination] = useState({});
    const [blockchain, setBlockchain] = useState(undefined);
    const [isSyncing, setSyncing] = useState(false);
    const [status, setStatus] = useState(Date.now());

    const syncChain = () => {
        if(!isSyncing)
            setBlockchain(undefined);
        axios
          .get(`/api/blockchain?page=${page}`)
          .then(res => {
              console.log(`Fetched data page: ${page}`);
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
        console.log(`Page no. changed renderer new page: ${page}`);
        syncChain();
        
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
                            </tbody>
                            </Table>
                            
                            <Pagination>
                            {/* <Pagination.First onClick={()=>setPage(1)} disabled={page==1} />
                            <Pagination.Prev onClick={()=>setPage(page=>page-1)} disabled={page==1}/> */}
                            <Pagination.Item onClick={()=>setPage(1)}>1</Pagination.Item>
                            { (page-2) > 2 ? <Pagination.Ellipsis /> : null }
                            
                            { paginationItems(page, pagination.maxPages, setPage) }

                            <Pagination.Ellipsis />
                            <Pagination.Item  onClick={()=>setPage(pagination.maxPages)} >{pagination.maxPages}</Pagination.Item>
                            {/* <Pagination.Next />
                            <Pagination.Last /> */}
                            </Pagination>

                    </div> : <Loader>
                        <HashLoader color={"#0466cf"} loading={true} size={150} />
                    </Loader>

            } 
        </Container>
    )
}

export default Blockchain
