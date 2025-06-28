// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      sku
      name
      price
      category
    }
  }
`;
