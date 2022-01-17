import {MongoMemoryServer} from 'mongodb-memory-server';
import data from './data';
import {logActivity} from './service';


describe('mongo data layer tests', ()=>{
  let dal;
  let mms;
  let user;
  beforeEach(async ()=>{
    mms = await MongoMemoryServer.create();
    const mongodbURL = mms.getUri();
    dal = await data({mongodbURL});
    user = await dal.createUser({name: 'testy', email: 'testy@nowhere.org'});
  });

  test('logActivity saves new tags', async ()=>{
    const lafn = logActivity({dal, userId: user._id});
    await lafn({text: 'this is a service activity', tags: ['work', 'play']});
    const blah = await dal.getActivities(user._id);
    expect(blah.length).toBe(1);
  });

  afterEach(async ()=>{
    mms.stop();
  });
});
