import { gql } from "@apollo/client";

export const CREATE_UPLOAD_MUTATION = gql`
mutation Upload($file: Upload!) {
  upload(file: $file) {
    data {
      id
    }
  }
}
`;
