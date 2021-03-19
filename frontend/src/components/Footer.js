import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

const Footer = () => {
  return (
    <footer className="mt-5">
      <Container>
        <Row>
          <Col className='text-center py-3'>
            &copy; Community ! &nbsp;&nbsp;
            <a href="https://github.com/OmkarPh/opcoin"> 
              Github <FontAwesomeIcon icon={faGithub} />
            </a>          
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
