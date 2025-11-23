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
      resolve: async (_, __, { prisma }, info: GraphQLResolveInfo) => {
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

        return await prisma.user.findMany(
          Object.keys(include).length > 0 ? { include } : {},
        );
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
