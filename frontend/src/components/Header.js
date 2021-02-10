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
        <Button as={Link} to="/nodes">Nodes</Button>
        <NavDropdown title="Utilities" id="collasible-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Mempool history</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">Block details</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
        </NavDropdown>
        </Nav>
        <Nav>
        <Button as={Link} to="/wallet" variant="success">Wallet</Button>
        <Nav.Link></Nav.Link>
        <Button as={Link} to="/mine" variant="warning">Mine a block</Button>
        <Button as={Link} to="/about" variant="Primary">About</Button>
        </Nav>
    </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;