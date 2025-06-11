import { ApolloClient, InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache();

const client = new ApolloClient({
  uri: 'https://appealing-nature-production.up.railway.app/graphql.php',
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',   // ⬅️ always fetch fresh schema/data
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',   // ⬅️ prevents use of old cache
      errorPolicy: 'all',
    },
  },
});

export default client;
