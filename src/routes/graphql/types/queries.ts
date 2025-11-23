import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLResolveInfo,
} from 'graphql';
import { parseResolveInfo, ResolveTree } from 'graphql-parse-resolve-info';
import { UUIDType } from './uuid.js';
import { MemberTypeIdType, MemberTypeType } from './member.js';
import { PostType } from './post.js';
import { ProfileType } from './profile.js';
import { UserType } from './user.js';

export const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (_, __, { prisma, loaders }, info: GraphQLResolveInfo) => {
        const parsedInfo = parseResolveInfo(info) as ResolveTree | null;
        const userFields = parsedInfo?.fieldsByTypeName?.User;

        const needsUserSubscribedTo = userFields?.userSubscribedTo !== undefined;
        const needsSubscribedToUser = userFields?.subscribedToUser !== undefined;

        const include: any = {};
        if (needsUserSubscribedTo) {
          include.userSubscribedTo = true;
        }
        if (needsSubscribedToUser) {
          include.subscribedToUser = true;
        }

        const users = await prisma.user.findMany(
          Object.keys(include).length > 0 ? { include } : {},
        );

        const authorIdsToLoad = new Set<string>();
        const subscriberIdsToLoad = new Set<string>();

        users.forEach((user: any) => {
          if (user.userSubscribedTo && Array.isArray(user.userSubscribedTo)) {
            if (
              user.userSubscribedTo.length > 0 &&
              user.userSubscribedTo[0]?.authorId &&
              !user.userSubscribedTo[0]?.author
            ) {
              user.userSubscribedTo.forEach((sub: any) => {
                if (sub.authorId) authorIdsToLoad.add(sub.authorId);
              });
            }
          }
          if (user.subscribedToUser && Array.isArray(user.subscribedToUser)) {
            if (
              user.subscribedToUser.length > 0 &&
              user.subscribedToUser[0]?.subscriberId &&
              !user.subscribedToUser[0]?.subscriber
            ) {
              user.subscribedToUser.forEach((sub: any) => {
                if (sub.subscriberId) subscriberIdsToLoad.add(sub.subscriberId);
              });
            }
          }
        });

        const loadedAuthors = new Map<string, any>();
        const loadedSubscribers = new Map<string, any>();

        if (authorIdsToLoad.size > 0) {
          const authors = await Promise.all(
            Array.from(authorIdsToLoad).map((id) => loaders.userLoader.load(id)),
          );
          Array.from(authorIdsToLoad).forEach((id, index) => {
            if (authors[index]) loadedAuthors.set(id, authors[index]);
          });
        }

        if (subscriberIdsToLoad.size > 0) {
          const subscribers = await Promise.all(
            Array.from(subscriberIdsToLoad).map((id) => loaders.userLoader.load(id)),
          );
          Array.from(subscriberIdsToLoad).forEach((id, index) => {
            if (subscribers[index]) loadedSubscribers.set(id, subscribers[index]);
          });
        }

        const transformedUsers = users.map((user: any) => {
          const transformed: any = { ...user };

          if (user.userSubscribedTo && Array.isArray(user.userSubscribedTo)) {
            if (user.userSubscribedTo.length > 0 && user.userSubscribedTo[0]?.author) {
              transformed.userSubscribedTo = user.userSubscribedTo.map(
                (sub: any) => sub.author,
              );
            } else if (
              user.userSubscribedTo.length > 0 &&
              user.userSubscribedTo[0]?.authorId
            ) {
              transformed.userSubscribedTo = user.userSubscribedTo
                .map((sub: any) => loadedAuthors.get(sub.authorId))
                .filter((u: any) => u !== undefined);
            } else {
              transformed.userSubscribedTo = user.userSubscribedTo;
            }
          }

          if (user.subscribedToUser && Array.isArray(user.subscribedToUser)) {
            if (
              user.subscribedToUser.length > 0 &&
              user.subscribedToUser[0]?.subscriber
            ) {
              transformed.subscribedToUser = user.subscribedToUser.map(
                (sub: any) => sub.subscriber,
              );
            } else if (
              user.subscribedToUser.length > 0 &&
              user.subscribedToUser[0]?.subscriberId
            ) {
              transformed.subscribedToUser = user.subscribedToUser
                .map((sub: any) => loadedSubscribers.get(sub.subscriberId))
                .filter((u: any) => u !== undefined);
            } else {
              transformed.subscribedToUser = user.subscribedToUser;
            }
          }

          return transformed;
        });

        transformedUsers.forEach((user) => {
          loaders.userLoader.prime(user.id, user);
          if (user.userSubscribedTo) {
            user.userSubscribedTo.forEach((subUser: any) => {
              loaders.userLoader.prime(subUser.id, subUser);
            });
          }
          if (user.subscribedToUser) {
            user.subscribedToUser.forEach((subUser: any) => {
              loaders.userLoader.prime(subUser.id, subUser);
            });
          }
        });

        return transformedUsers;
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        return await prisma.user.findUnique({
          where: { id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: async (_, __, { prisma }) => {
        return await prisma.post.findMany();
      },
    },
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        return await prisma.post.findUnique({
          where: { id },
        });
      },
    },
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberTypeType))),
      resolve: async (_, __, { prisma }) => {
        return await prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberTypeType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        return await prisma.memberType.findUnique({
          where: { id },
        });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
      resolve: async (_, __, { prisma }) => {
        return await prisma.profile.findMany();
      },
    },
    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        return await prisma.profile.findUnique({
          where: { id },
        });
      },
    },
  },
});
