import React from 'react'
import { Row, Col, Button } from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCopy } from '@fortawesome/free-solid-svg-icons';

import minify from '../utility/minify';

const Transaction = ({tx}) => {
    return (
        <Row className="border-bottom border-black border-darken-2 py-2 my-2">
            <Col>
                {
                    tx.inputs.map(inp => {
                        return(
                            <Row>
                                <Col xs={8} alt={inp.sender}>
                                    { minify(inp.sender, 35) }
                                    {
                                        inp.sender != 'COINBASE' ?
                                        <Button
                                            className="" 
                                            variant="light"  
                                            onClick={(e)=>{
                                                e.preventDefault();
                                                window && window.navigator.clipboard.writeText(inp.sender)
                                            }}
                                        >
                                            <small>
                                                <FontAwesomeIcon icon={faCopy} />
                                            </small>
                                        </Button>
                                        : null
                                    }
                                </Col>
                                <Col>
                                    {Number(inp.amount).toFixed(5)} OPs
                                </Col>
                            </Row>
                        );
                    })
                }
            </Col>

            <Col sm={12} md={1} className="align-content-center">
                <FontAwesomeIcon icon={faSignOutAlt} />
            </Col>

            <Col>
                {
                    tx.outputs.map(out => {
                        return(
                            <Row>
                                <Col xs={8}>
                                    {minify(out.receiver, 35)}
                                    {
                                        out.receiver != 'COINBASE' ?
                                        <Button
                                            className="" 
                                            variant="light"  
                                            onClick={(e)=>{
                                                e.preventDefault();
                                                window && window.navigator.clipboard.writeText(out.receiver)
                                            }}
                                        >
                                            <small>
                                                <FontAwesomeIcon icon={faCopy} />
                                            </small>
                                        </Button>
                                        : null
                                    }
                                </Col>
                                <Col>
                                    {Number(out.amount).toFixed(5)} OPs
                                </Col>
                            </Row>
                        );
                    })
                }
            </Col>
        </Row>
    )
}

export default Transaction
