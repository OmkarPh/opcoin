import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import {Helmet} from 'react-helmet';
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css';

import Home from './pages/Home'
import Blockchain from './pages/Blockchain'
import Mempool from './pages/Mempool';
import Miner from './pages/Miner';
import Wallet from './pages/Wallet';
import Block from './pages/Block';

import axios from 'axios';

function App() {
  return (
    <Router class="coverer">
      <Helmet title="OP coin" />
      <Header />
        <main className='py-3'>
          <Switch>
            <Route path='/' component={Home} exact />
            <Route path='/blockchain' component={Blockchain} exact />
            <Route path='/transactions' component={Mempool} exact />
            <Route path='/mine' component={Miner} exact />
            <Route path='/block/:blockNo' component={Block} blockNo={5}/>
            <Route path='/wallet' component={Wallet} exact />
          </Switch>
        </main>
      <Footer />
    </Router>
  )
}

export default App;
