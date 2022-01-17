import {buildSchema} from 'graphql';

export const schema = buildSchema(`
  type Activity {
    id: ID!
    text: String!
    tagIds: [String]
  }
  type Tag {
    id: ID!
    text: String!
    timeTracked: Boolean
  }
  type Query {
    today: [Activity]
    tags: [Tag]
  }
  type Mutation {
      logActivity(text: String!, tags: [String]): Activity
  }
`);

