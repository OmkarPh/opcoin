import React from 'react'
import { Container, Image } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import mining from '../assets/images/mining.jpg'
import balance from '../assets/images/balance.jpg'

const Home = () => {
    return (
        <Container>
            <h3> What is OP coin ?</h3><br/>
            <p className="lead">
                OP coin infrastructure is an entire blockchain built from <u>scratch</u> using React and Node.js. <br/>
                'OP coin' is the token mechanism built on top of this blockchain that allows transactions in the form of UTXOs (Unspent transaction output) similar to Bitcoin
            </p><br/>
            <p>
                Technically, entire application is a 'OP node' just like any 'Bitcoin full node'. Every device that is a part of OP coin is a node member of OP coin. <br/>
                These nodes/devices are connected via a P2P network without any central server where all nodes publicly broadcast messages using the <Link to='/info/pubsub'>Publisher-Subscriber model</Link><br/>
                Read more about project structure <Link to='/info/project'>here.</Link>
            </p><br/>
            <h5>
                Here is a simple workflow:
            </h5>
            <Image src={mining} fluid />
            <Image src={balance} fluid className="mt-5"/>
        </Container>
    )
}

export default Home
