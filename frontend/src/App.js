import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css';

import Home from './pages/Home'
import Blockchain from './pages/Blockchain'
import Mempool from './pages/Mempool';
import Miner from './pages/Miner';
import Wallet from './pages/Wallet';

function App() {
  return (
    <Router class="coverer">
      <Header />
        <main className='py-3'>
        <Container>
          <Switch>
            <Route path='/' component={Home} exact />
            <Route path='/blockchain' component={Blockchain} exact />
            <Route path='/transactions' component={Mempool} exact />
            <Route path='/mine' component={Miner} exact />
            <Route path='/wallet' component={Wallet} exact />
          </Switch>
          I'm permanent
        </Container>
        </main>
      <Footer />
    </Router>
  )
}

export default App;
