import React, {useEffect, useState } from 'react'
import axios from 'axios';
import { Container, Card, ListGroup, Table, Row, Col } from 'react-bootstrap';
import { MDBBtn } from 'mdbreact';
import HashLoader from "react-spinners/HashLoader";

const Blockchain = () => {
    const [blockchain, setBlockchain] = useState(undefined);
    useEffect(() => {
        axios
          .get("/api/blockchain")
          .then(res => {
              console.log(res.data.chain);
            //   setTimeout(()=>setBlockchain(res.data.chain), 1500);
            //   setBlockchain(res.data.chain);
          })
          .catch(err => console.error(err));        
    }, []);

    return (
        <>
            <Container>
                {
                    blockchain ?
                        <div>
                            Current Length of blockchain: {blockchain.length}
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                    <th>#</th>
                                    <th>Hash</th>
                                    <th>Transactions</th>
                                    <th>Prev Hash</th>
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
                                                    <td>{block.timestamp}</td> {""}
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                                </Table>

                        </div> :
                        <div>
                        <center>
                            <br/><br/>
                                <HashLoader color={"#0411E0"} loading={true} size={150} />
                        </center>
                        </div>

                } 
            </Container>
            {
                blockchain ? "Got it" : "Loading....."
            }
            <div>
                Blockchain here !
            </div>
        </>
    )
}

export default Blockchain
