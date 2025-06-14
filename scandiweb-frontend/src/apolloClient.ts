import { ApolloClient, InMemoryCache } from '@apollo/client';

// Switch based on hostname or environment variable
const isDev = !window.location.hostname.includes('railway.app');


const client = new ApolloClient({
  uri: isDev
    ? 'http://localhost:8000/graphql.php'
    : 'https://appealing-nature-production.up.railway.app/graphql.php',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

export default client;
