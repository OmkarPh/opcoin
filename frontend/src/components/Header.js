import React from 'react'
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, Nav, NavDropdown, Button } from 'react-bootstrap'

import OPicon from '../assets/OPicon.png'

const Header = () => {
  return (
    <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
    <Navbar.Brand as={Link} to="/">
      <img
        alt=""
        src={OPicon}
        width="75"
        className="d-inline-block align-top"
      />{' '}
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto ml-10">
        <Button as={Link} to="/blockchain">Blockchain</Button>
        <Button as={Link} to="/transactions">Transactions</Button>
        <NavDropdown title="Info" id="collasible-nav-dropdown">
            <NavDropdown.Item as={Link} to="/info/blockchain">Blockchain</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/info/project">OP coin project structure</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/info/pubsub">PubSub model</NavDropdown.Item>
        </NavDropdown>
        </Nav>
        <Nav>
        <Button as={Link} to="/wallet" variant="success">Wallet</Button>
        <Nav.Link></Nav.Link>
        <Button as={Link} to="/mine" variant="warning">Mine a block</Button>
        </Nav>
    </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;