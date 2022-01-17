import express from 'express';
import cors from 'cors';
import {graphqlHTTP} from 'express-graphql';
import data from './data.js';
import {schema} from './gqlSchema.js';
import {logActivity} from './service.js';

// TODO: ditch this.
const userId = '61e31cfe8fa575c8fa89b093';

(async ()=>{
  const app = express();
  const dal = await data();


  // The root provides a resolver function for each API endpoint
  const root = {
    tags: async () => {
      return (await dal.getTags(userId))
        .map((t)=>({
          id: t._id.toString(),
          text: t.text,
        }));
    },
    today: async () => {
      return getToday();
    },
    logActivity: logActivity({dal, userId}),
  };


  app.use(cors());
  app.options('localhost:3000', cors());
  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,

  }));


  app.listen(8080);
  console.log('Running a GraphQL API server at http://localhost:8080/graphql');
})();
