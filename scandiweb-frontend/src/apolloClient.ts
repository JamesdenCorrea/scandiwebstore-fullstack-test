import { ApolloClient, InMemoryCache } from '@apollo/client';

// Switch based on hostname or environment variable
const isLocalhost = window.location.hostname === 'localhost';

const client = new ApolloClient({
  uri: isLocalhost
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
