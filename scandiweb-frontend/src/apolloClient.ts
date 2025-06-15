import { ApolloClient, InMemoryCache } from '@apollo/client';

// Switch based on hostname or environment variable
const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const client = new ApolloClient({
  uri: isLocal
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
