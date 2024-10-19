import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Line } from 'react-chartjs-2'; 

const UNISWAP_V3_SUBGRAPH_URL = 'http://localhost:5001/api/graphql';

const App = () => {
  const [account, setAccount] = useState(null);
  const [userData, setUserData] = useState(null);
  const [chartData, setChartData] = useState({});

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        fetchUniswapData(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask not detected');
    }
  };

  const fetchUniswapData = async (account) => {
    const query = {
      query: `{
        tokens(first: 5) {
          id
          symbol
          name
          derivedETH
        }
        positions(first: 5, where: { owner: "${account}" }) {
          id
          liquidity
          token0 {
            symbol
          }
          token1 {
            symbol
          }
        }
      }`,
    };

    try {
      const response = await fetch(UNISWAP_V3_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'no-cors', // Bypass CORS restrictions
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      setUserData(result.data);
    } catch (error) {
      console.error('Error fetching data from Uniswap subgraph:', error);
    }
  };

  return (
    <div>
      <h1>Web3 Wallet Authentication with Uniswap Data</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      {account && (
        <div>
          <p>Connected Account: {account}</p>
          {userData && (
            <div>
              <h2>Token Balances</h2>
              {userData.tokens.length > 0 ? (
                <ul>
                  {userData.tokens.map((token) => (
                    <li key={token.id}>
                      {token.symbol} - {token.derivedETH} ETH
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tokens found</p>
              )}

              <h2>Liquidity Positions</h2>
              {userData.positions.length > 0 ? (
                <ul>
                  {userData.positions.map((position) => (
                    <li key={position.id}>
                      Liquidity: {position.liquidity}, Tokens: {position.token0.symbol}/{position.token1.symbol}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No liquidity positions found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
