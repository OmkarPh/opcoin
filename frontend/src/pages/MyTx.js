import React, {useState, useEffect} from 'react';
import Helmet from 'react-helmet';
import { Container } from 'react-bootstrap';
import axios from 'axios';

import HashLoader from "react-spinners/HashLoader";
import Loader from '../components/Loader';
import Transaction from '../components/Transaction';

const MyTx = () => {
    const [myTx, setMyTx] = useState(undefined);

    useEffect(()=>{
        axios
          .get(`/api/tx/myTx`)
          .then(res => {
              setTimeout(()=>{
                  setMyTx(res.data);
            }, 1000);
          })
          .catch(err => console.error(err));        
    }, []);

    return (
        <Container>
            {
                myTx ?
                <div>
                    <Helmet title={'My transactions'} />
                    <h2>My transactions (Both spent and unspent): </h2>
                    {
                        myTx.map(tx => <Transaction tx={tx} />)
                    }
                </div>
                : 
                <Loader>
                    <HashLoader color={"#03a30b"} loading={true} size={150} />
                </Loader>
            }
        </Container>
    )
}

export default MyTx
