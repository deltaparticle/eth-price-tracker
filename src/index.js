import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import App from './App';

const client = new ApolloClient({
  uri: 'http://localhost:3000/api/graphql',
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
