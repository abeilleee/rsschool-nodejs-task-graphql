import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

// Типы
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLInt },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    surname: { type: GraphQLString },
    subscribedToUserIds: {
      type: new GraphQLList(GraphQLInt),
      resolve: (parent) => parent.subscribedToUserIds || [],
    },
    subscribers: {
      type: new GraphQLList(UserType),
      resolve: (parent, _, { loaders }) => {
        return loaders.userLoader.loadMany(parent.subscribedToUserIds || []);
      },
    },
    subscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (parent, _, { loaders }) => {
        return loaders.subscribedToLoader.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (parent, _, { loaders }) => {
        return loaders.userPostsLoader.load(parent.id);
      },
    },
    profile: {
      type: ProfileType,
      resolve: (parent, _, { loaders }) => {
        return loaders.userProfileLoader.load(parent.id);
      },
    },
    likedPosts: {
      type: new GraphQLList(PostType),
      resolve: (parent, _, { loaders }) => {
        return loaders.userLikedPostsLoader.load(parent.id);
      },
    },
  }),
});

const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: GraphQLString },
    discount: { type: GraphQLInt },
    postsLimitPerMonth: { type: GraphQLInt },
  },
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: GraphQLInt },
    userId: { type: GraphQLInt },
    bio: { type: GraphQLString },
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
  },
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLInt },
    author: {
      type: UserType,
      resolve: (parent, _, { loaders }) => {
        return loaders.userLoader.load(parent.authorId);
      },
    },
    likedBy: {
      type: new GraphQLList(UserType),
      resolve: (parent, _, { loaders }) => {
        return loaders.postLikedByLoader.load(parent.id);
      },
    },
  },
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
        id: { type: new GraphQLNonNull(GraphQLInt) },
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
        id: { type: new GraphQLNonNull(GraphQLInt) },
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
        id: { type: new GraphQLNonNull(GraphQLString) },
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
        id: { type: new GraphQLNonNull(GraphQLInt) },
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
        email: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        surname: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { email, name, surname }, { prisma }) => {
        return await prisma.user.create({
          data: { email, name, surname, subscribedToUserIds: [] },
        });
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        email: { type: GraphQLString },
        name: { type: GraphQLString },
        surname: { type: GraphQLString },
      },
      resolve: async (_, { id, email, name, surname }, { prisma }) => {
        return await prisma.user.update({
          where: { id },
          data: { email, name, surname },
        });
      },
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
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
        userId: { type: new GraphQLNonNull(GraphQLInt) },
        subscriberId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { userId, subscriberId }, { prisma }) => {
        await prisma.user.update({
          where: { id: subscriberId },
          data: {
            subscribedToUser: {
              connect: { id: userId },
            },
          },
        });
        return await prisma.user.findUnique({
          where: { id: subscriberId },
        });
      },
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLInt) },
        subscriberId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { userId, subscriberId }, { prisma }) => {
        await prisma.user.update({
          where: { id: subscriberId },
          data: {
            subscribedToUser: {
              disconnect: { id: userId },
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
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { title, content, authorId }, { prisma }) => {
        return await prisma.post.create({
          data: { title, content, authorId },
        });
      },
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
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
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.post.delete({
          where: { id },
        });
        return true;
      },
    },
    likePost: {
      type: PostType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLInt) },
        userId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { postId, userId }, { prisma }) => {
        await prisma.post.update({
          where: { id: postId },
          data: {
            likedBy: {
              connect: { id: userId },
            },
          },
        });
        return await prisma.post.findUnique({
          where: { id: postId },
        });
      },
    },
    unlikePost: {
      type: PostType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLInt) },
        userId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { postId, userId }, { prisma }) => {
        await prisma.post.update({
          where: { id: postId },
          data: {
            likedBy: {
              disconnect: { id: userId },
            },
          },
        });
        return await prisma.post.findUnique({
          where: { id: postId },
        });
      },
    },
    createProfile: {
      type: ProfileType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLInt) },
        memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
        bio: { type: GraphQLString },
      },
      resolve: async (_, { userId, memberTypeId, bio }, { prisma }) => {
        return await prisma.profile.create({
          data: { userId, memberTypeId, bio: bio || '' },
        });
      },
    },
    updateProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        memberTypeId: { type: GraphQLString },
        bio: { type: GraphQLString },
      },
      resolve: async (_, { id, memberTypeId, bio }, { prisma }) => {
        return await prisma.profile.update({
          where: { id },
          data: { memberTypeId, bio },
        });
      },
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
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
