import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { ChangeUserInput, CreateUserInput, UserType } from './user.js';
import { UUIDType } from './uuid.js';
import { ChangePostInput, CreatePostInput, PostType } from './post.js';
import { ChangeProfileInput, CreateProfileInput, ProfileType } from './profile.js';

export const RootMutation = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (_, { dto }, { prisma }) => {
        return await prisma.user.create({
          data: dto,
        });
      },
    },
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) => {
        return await prisma.user.update({
          where: { id },
          data: dto,
        });
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.user.delete({
          where: { id },
        });
        return 'deleted';
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }, { prisma }) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            authorId: authorId,
            subscriberId: userId,
          },
        });
        return 'subscribed';
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
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
        return 'unsubscribed';
      },
    },
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: async (_, { dto }, { prisma }) => {
        return await prisma.post.create({
          data: dto,
        });
      },
    },
    changePost: {
      type: new GraphQLNonNull(PostType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) => {
        return await prisma.post.update({
          where: { id },
          data: dto,
        });
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.post.delete({
          where: { id },
        });
        return 'deleted';
      },
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: async (_, { dto }, { prisma }) => {
        return await prisma.profile.create({
          data: dto,
        });
      },
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) => {
        return await prisma.profile.update({
          where: { id },
          data: dto,
        });
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.profile.delete({
          where: { id },
        });
        return 'deleted';
      },
    },
  },
});
