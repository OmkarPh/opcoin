import React, {useState, useEffect} from 'react'
import { useParams } from 'react-router-dom';
import {Link} from 'react-router-dom';
import HashLoader from "react-spinners/HashLoader";
import {Container, ListGroup, Row, Col, Button} from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import Loader from '../components/Loader';
import Transaction from '../components/Transaction';

import axios from 'axios';
import minify from '../utility/minify';

const Entry = ({label, content}) => {
    return(
        <ListGroup.Item>
            <Row>
                <Col md={4} sm={3}>{label}</Col> <Col>{content}</Col>
            </Row>
        </ListGroup.Item>
    );
}

const Block = (props) => {
    const { blockNo } = useParams();
    const [block, setBlock] = useState(undefined);
    const [transactions, setTransactions] = useState(undefined);
    const [error, setError] = useState(undefined);
    
    useEffect(()=>{
        axios
          .get(`/api/block/${blockNo}`)
          .then(res => {
              console.log(res.data);
              let dateTime = new Date(Number(res.data.timestamp));
              res.data.timestamp = `${dateTime.toDateString()}, ${dateTime.toLocaleTimeString()}`;
              setTransactions(res.data.transactions);
              setBlock(res.data);
          })
          .catch(err => setError(err.response.data));
    }, []);


    return (
        <div>
            {
                error ?
                    <div className="text-center">
                        Sorry, we couldn't find block no. {blockNo}
                        <br/>
                        <Link to="/blockchain">Explore blocks here</Link>
                    </div> 
                : block ?
                    <Container className="align-self-md-start mt-lg-3" style={{fontSize: "18px"}}>
                        <Helmet title={`Block ${block.height}`} />
                        <Link as="link" to="/blockchain" className="mb-4 pt-0 d-block">
                            {'<- All blocks'}
                        </Link>
                        <h2>
                            Block #{block.height}
                        </h2>
                        <ListGroup variant="flush">
                            <Entry label="Hash" 
                                content={
                                    (window && window.innerWidth >= 992) ?
                                    block.hash
                                    : minify(block.hash, 32)
                                } 
                            />
                            <Entry label="Nonce" content={block.nonce}/>
                            <Entry label="Mined at" 
                                content = {block.timestamp}
                            />
                            <Entry label="Miner" content={
                                    (window && window.innerWidth >= 992) ?
                                    minify(transactions[0].outputs[0].receiver, 64, 5)
                                    : minify(transactions[0].outputs[0].receiver, 32, 2)
                                }
                            />
                            <Entry label="Mining reward" content={transactions[0].outputs[0].amount} />
                            <Entry label="Previous hash" content={
                                (window && window.innerWidth >= 992) ?
                                block.prevHash
                                : minify(block.prevHash, 32)
                            } />
                            <Entry label="No. of transactions" content={block.transactions.length} />
                            <Row>
                                <h4 className="my-4">Transactions</h4>
                            </Row>
                            {
                                transactions.map(tx => <Transaction tx={tx} />)
                            }
                        </ListGroup>                        
                    </Container>
                : 
                <Loader>
                    <HashLoader color={"#0466cf"} loading={true} size={150} />
                </Loader>
            }
        </div>
    )
}

export default Block
