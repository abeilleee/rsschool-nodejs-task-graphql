import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  Kind,
} from 'graphql';
import { UUIDType } from './uuid.js';

export const MemberTypeIdType = new GraphQLScalarType({
  name: 'MemberTypeId',
  description: 'MemberType ID custom scalar type',
  serialize(value) {
    return String(value);
  },
  parseValue(value) {
    return String(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  },
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
    author: {
      type: UserType,
      resolve: (parent, _, { loaders }) => {
        return loaders.userLoader.load(parent.authorId);
      },
    },
  }),
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLString },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: (parent, _, { loaders }) => {
        return loaders.userLoader.load(parent.userId);
      },
    },
    memberType: {
      type: MemberTypeType,
      resolve: (parent, _, { prisma }) => {
        return prisma.memberType.findUnique({
          where: { id: parent.memberTypeId },
        });
      },
    },
  }),
});

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      resolve: (parent, _, { loaders }) => {
        return loaders.userProfileLoader.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (parent, _, { loaders }) => {
        return loaders.userPostsLoader.load(parent.id);
      },
    },

    subscribers: {
      type: new GraphQLList(UserType),
      resolve: (parent, _, { loaders }) => {
        return loaders.subscribersLoader.load(parent.id);
      },
    },
    subscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (parent, _, { loaders }) => {
        return loaders.subscribedToLoader.load(parent.id);
      },
    },

    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (parent, _, { loaders }) => {
        return loaders.subscribedToLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: (parent, _, { loaders }) => {
        return loaders.subscribersLoader.load(parent.id);
      },
    },
  }),
});

// Запросы
export const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_, __, { prisma }) => {
        return await prisma.user.findMany();
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
      type: new GraphQLList(PostType),
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
      type: new GraphQLList(MemberTypeType),
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
      type: new GraphQLList(ProfileType),
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

// Мутации
export const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
      },
      resolve: async (_, { name, balance }, { prisma }) => {
        return await prisma.user.create({
          data: { name, balance },
        });
      },
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
      },
      resolve: async (_, { id, name, balance }, { prisma }) => {
        return await prisma.user.update({
          where: { id },
          data: { name, balance },
        });
      },
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.user.delete({
          where: { id },
        });
        return true;
      },
    },
    subscribeTo: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { userId, authorId }, { prisma }) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            authorId: authorId,
            subscriberId: userId,
          },
        });
        return await prisma.user.findUnique({
          where: { id: userId },
        });
      },
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { userId, authorId }, { prisma }) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId: authorId,
            },
          },
        });
        return true;
      },
    },
    createPost: {
      type: PostType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { title, content, authorId }, { prisma }) => {
        return await prisma.post.create({
          data: { title, content, authorId },
        });
      },
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      resolve: async (_, { id, title, content }, { prisma }) => {
        return await prisma.post.update({
          where: { id },
          data: { title, content },
        });
      },
    },
    deletePost: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.post.delete({
          where: { id },
        });
        return true;
      },
    },
    createProfile: {
      type: ProfileType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { userId, memberTypeId, isMale, yearOfBirth }, { prisma }) => {
        return await prisma.profile.create({
          data: { userId, memberTypeId, isMale, yearOfBirth },
        });
      },
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        memberTypeId: { type: GraphQLString },
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
      },
      resolve: async (_, { id, memberTypeId, isMale, yearOfBirth }, { prisma }) => {
        return await prisma.profile.update({
          where: { id },
          data: { memberTypeId, isMale, yearOfBirth },
        });
      },
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.profile.delete({
          where: { id },
        });
        return true;
      },
    },
  },
});
