import React from 'react'
import { Container, Image } from 'react-bootstrap';
import Helmet from 'react-helmet';
import { useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

// Blockchain
import blockchainOverview from '../assets/images/blockchainOverview.png';
import powBlockchain from '../assets/images/powBlockchain.png';

// Project
import basicOverview from '../assets/images/basicOverview.jpg';
import structure from '../assets/images/structure.jpg';

// Pubsub
import pubsub from '../assets/images/pubsub.png';


const Info = () => {
    const { about } = useParams();

    return (
        about == 'project' ?
        <Container >
            <Helmet title={'Project structure'} />
            <h3>Project structure</h3>
            <Image src={structure} fluid className="border border-black" />
            <br/><br/><br/>
            <Image src={basicOverview} fluid className="border border-black" />
        </Container>

        : about == 'pubsub' ?
        <Container>
            <Helmet title={'Publisher subscriber model'} />
            <h3>Publisher Subscriber model</h3>

            Read:<br/>
            <a href='https://ably.com/topic/pub-sub' target="_blank">
                <FontAwesomeIcon icon={faLink} /> ably.com/topic/pub-sub
            </a><br/>
            <a href='https://cloud.google.com/pubsub/docs/overview' target="_blank">
                <FontAwesomeIcon icon={faLink} /> cloud.google.com/pubsub/docs/overview
            </a><br/><br/>

            <Image src={pubsub} fluid  className="border border-black"/>
            <br/><br/><br/>
            <Image src={structure} fluid className="border border-black"/>
        </Container>

        :
        <Container>
            <Helmet title={'Blockchain'} />
            <h3>General Blockchain structure</h3>
            <Image src={blockchainOverview} height="300px" className="border border-black"/>
            <br/><br/>
            <h3></h3>
            <Image src={powBlockchain} height="500px" className="border border-black"/>
        </Container>
    )
}

export default Info
