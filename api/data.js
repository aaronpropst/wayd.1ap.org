import {MongoClient, ObjectId} from 'mongodb';

const collections = {
  activities: 'activities',
  tags: 'tags',
  users: 'users',
};

export default async function data(params={}) {
  const url = params.mongodbURL || 'mongodb://127.0.0.1:27017';
  const dbName = 'wayd';
  const mongoClient = new MongoClient(url);
  const conn = await mongoClient.connect();
  const db = conn.db(dbName);

  const reconcileTags = async (userId, tagStrings)=>{
    const tags = await getTags(userId);
    return tagStrings.reduce((out, ts)=>{
      const kt = tags.find(({text})=> text === ts);
      if (kt) {
        out.knownTags.push(kt);
      } else {
        out.newTags.push({
          user: toObjectId(userId),
          text: ts,
          timeTracked: false,
        });
      }
      return out;
    }, {knownTags: [], newTags: []});
  };

  const toObjectId = (thing) => typeof thing === 'string' ?
    ObjectId.createFromHexString(thing) : thing;

  const getActivities = async (userId)=>{
    return db.collection(collections.activities).find({
      user: toObjectId(userId),
    }).toArray();
  };

  const logActivity = async (userId, {text, tagIds})=>{
    const {insertedId} = await db.collection(collections.activities).insertOne({
      text,
      user: toObjectId(userId),
      tagIds,
      created: new Date(),
    });
    return db.collection(collections.activities)
      .findOne({_id: insertedId});
  };

  const createUser = async ({name, email}) => {
    const {insertedId} = await db.collection(collections.users).insertOne({
      name,
      email,
      created: new Date(),
    });
    return db.collection(collections.users)
      .findOne({_id: insertedId});
  };

  /**
   * Should be for internal use only really. tags will be lazy created by activities
   * @param {string|Object} userId
   */
  const createTag = async (userId, {text, timeTracked})=>{
    const {insertedId} = await db.collection(collections.tags)
      .insertOne({
        user: toObjectId(userId),
        text,
        timeTracked,
        created: new Date(),
      });
    return insertedId;
  };

  const getTags = async (userId)=>
    db.collection(collections.tags).find({
      user: toObjectId(userId),
    }).toArray();

  const getUserCount = async ()=>db.collection(collections.users).countDocuments();


  return {
    db,
    createUser,
    getUserCount,
    logActivity,
    getActivities,
    createTag,
    getTags,
    reconcileTags,
  };
};
