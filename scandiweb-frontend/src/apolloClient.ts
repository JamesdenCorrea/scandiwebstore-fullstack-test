import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://appealing-nature-production.up.railway.app/graphql.php',
  cache: new InMemoryCache(),
});

export default client;
