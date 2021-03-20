import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import {Helmet} from 'react-helmet';
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css';

import Home from './pages/Home';
import Blockchain from './pages/Blockchain';
import Mempool from './pages/Mempool';
import MyTx from './pages/MyTx';
import Miner from './pages/Miner';
import Wallet from './pages/Wallet';
import Block from './pages/Block';
import ChangePrivateKey from './pages/ChangePrivate';
import Info from './pages/Info';


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
            <Route path='/transactions/myTx' component={MyTx} exact />
            <Route path='/mine' component={Miner} exact />
            <Route path='/block/:blockNo' component={Block}/>
            <Route path='/wallet' component={Wallet} exact />
            <Route path='/info/:about' component={Info} exact />
            <Route path='/keyChange' component={ChangePrivateKey} exact />
            <Redirect to='/' />
          </Switch>
        </main>
      <Footer />
    </Router>
  )
}

export default App;
