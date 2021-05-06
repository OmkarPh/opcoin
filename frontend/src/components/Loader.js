import React, {  } from 'react'
// import HashLoader from "react-spinners/HashLoader";
import { Row, Col } from 'react-bootstrap';

const Loader = ({children}) => {
    return (
        <Row style={{height: "100%"}}>
            <Col sm={5}  />
            <Col sm={2}>
                <center>
                    <div className="d-flex justify-center align-items-center">
                            { children }
                    </div>
                </center>
            </Col>
        </Row>
    )
}

export default Loader
