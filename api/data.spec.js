import {MongoMemoryServer} from 'mongodb-memory-server';
import data from './data';


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

  test('should create a mongo memory or mongodb connection', async ()=>{
    await dal.db.collection('activities').insertOne({
      text: 'I wrote unit tests for mongo',
      tagIds: [
      ],

    });
    await dal.db.collection('activities').find({}).toArray();
  });

  test('should be able to get activities from dal', async ()=>{
    await dal.logActivity(
      user._id,
      {
        text: 'I wrote get activity code',
        tagIds: [],
      });
    const activities = await dal.getActivities(user._id);
    expect(activities[0]).toMatchInlineSnapshot(
      {
        _id: expect.anything(),
        user: expect.anything(),
        created: expect.any(Date),
      },
      `
        Object {
          "_id": Anything,
          "created": Any<Date>,
          "tagIds": Array [],
          "text": "I wrote get activity code",
          "user": Anything,
        }
      `);
  });

  test('add activities with dal', async ()=>{
    const blah = await dal.logActivity(
      user._id,
      {
        text: 'I wrote add activity code',
        tagIds: [],
      });
    expect(blah).toMatchInlineSnapshot(
      {
        _id: expect.anything(),
        created: expect.any(Date),
        user: expect.anything(),
      },
      `
        Object {
          "_id": Anything,
          "created": Any<Date>,
          "tagIds": Array [],
          "text": "I wrote add activity code",
          "user": Anything,
        }
      `);
  });
  test('can create tag and get an id back', async ()=>{
    const insertedId = await dal.createTag(
      user._id,
      {
        text: 'work',
        timeTracked: false,
      },
    );
    expect(insertedId.toString()).toMatch(/[a-f0-9]{24}/);
  });

  test('can get tags', async ()=>{
    await Promise.all(
      ['work', 'play', 'life'].map((t)=>
        dal.createTag(
          user._id,
          {
            text: t,
            timeTracked: false,
          },
        ),
      ),
    );
    const tags = await dal.getTags(user._id);
    expect(tags.map((t) => t.text)).toMatchInlineSnapshot(`
      Array [
        "work",
        "play",
        "life",
      ]
    `);
  });
  test('reconcile tags works', async ()=>{
    await Promise.all(
      ['work', 'play', 'life'].map((t)=>
        dal.createTag(
          user._id,
          {
            text: t,
            timeTracked: false,
          },
        ),
      ),
    );

    const blah = await dal.reconcileTags(user._id, ['work', 'squids', 'life']);
    expect(blah.knownTags.map((t) => t.text)).toMatchInlineSnapshot(`
      Array [
        "work",
        "life",
      ]
    `);
    expect(blah.newTags.map((t) => t.text)).toMatchInlineSnapshot(`
      Array [
        "squids",
      ]
    `);
  });

  test.todo('activities should be user scoped');
  test.todo('saving activities should be user scoped');
  test.todo('activities with existing tags should get the right tagids');
  test.todo('activities with new tags should create those tags and return the right ids');

  afterEach(async ()=>{
    mms.stop();
  });
});
