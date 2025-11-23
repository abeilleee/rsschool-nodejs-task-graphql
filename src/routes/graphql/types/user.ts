import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { PostType } from './post.js';
import { ProfileType } from './profile.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: (parent, _, { loaders }) => {
        return loaders.userProfileLoader.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: (parent, _, { loaders }) => {
        return loaders.userPostsLoader.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: (parent: any, _, { loaders }) => {
        if (parent.userSubscribedTo && Array.isArray(parent.userSubscribedTo)) {
          if (parent.userSubscribedTo.length > 0) {
            const first = parent.userSubscribedTo[0];

            if (first?.author) {
              return parent.userSubscribedTo.map((sub: any) => sub.author);
            }

            if (first?.id && first?.name !== undefined) {
              return parent.userSubscribedTo;
            }
          } else {
            return [];
          }
        }
        return loaders.subscribedToLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: (parent: any, _, { loaders }) => {
        if (parent.subscribedToUser && Array.isArray(parent.subscribedToUser)) {
          if (parent.subscribedToUser.length > 0) {
            const first = parent.subscribedToUser[0];

            if (first?.subscriber) {
              return parent.subscribedToUser.map((sub: any) => sub.subscriber);
            }

            if (first?.id && first?.name !== undefined) {
              return parent.subscribedToUser;
            }
          } else {
            return [];
          }
        }
        return loaders.subscribersLoader.load(parent.id);
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
