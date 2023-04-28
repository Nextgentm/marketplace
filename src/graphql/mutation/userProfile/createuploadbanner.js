import { gql } from "@apollo/client";

export const CREATE_UPLOAD_MUTATION = gql`
mutation ($file: Upload!) {
    createUpload(file: $file) {
      id
      url
    }
  }

  `;
