

export const logActivity = ({dal, userId}) => async ({text, tags})=>{
  const {knownTags, newTags} = await dal.reconcileTags(userId, tags);

  const tagIdsToAttach = knownTags.map(({_id})=>_id);
  if (newTags.length > 0) {
    const createdTagIds = await Promise.all(
      newTags.map((tag)=>
        dal.createTag(userId, tag),
      ),
    ).catch((err)=>console.log(err));

    tagIdsToAttach.push(...createdTagIds);
  }

  await dal.logActivity(userId, {
    text,
    tagIds: tagIdsToAttach,
  });
  return;
};
