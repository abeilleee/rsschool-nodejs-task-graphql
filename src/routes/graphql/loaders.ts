import DataLoader from 'dataloader';
import { PrismaClient, User, Post, Profile } from '@prisma/client';

export function createLoaders(prisma: PrismaClient) {
  const userLoader = new DataLoader<string, User | null>(async (userIds) => {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds as string[],
        },
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));
    return userIds.map((id) => userMap.get(id) || null);
  });

  const subscribersLoader = new DataLoader<string, User[]>(async (authorIds) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        authorId: {
          in: authorIds as string[],
        },
      },
      include: {
        subscriber: true,
      },
    });

    const subscribersByAuthor = new Map<string, User[]>();
    authorIds.forEach((id) => subscribersByAuthor.set(id, []));

    subscriptions.forEach((sub) => {
      const subscribers = subscribersByAuthor.get(sub.authorId);
      if (subscribers) {
        subscribers.push(sub.subscriber);
      }
    });

    return authorIds.map((id) => subscribersByAuthor.get(id) || []);
  });

  const subscribedToLoader = new DataLoader<string, User[]>(async (subscriberIds) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        subscriberId: {
          in: subscriberIds as string[],
        },
      },
      include: {
        author: true,
      },
    });

    const authorsBySubscriber = new Map<string, User[]>();
    subscriberIds.forEach((id) => authorsBySubscriber.set(id, []));

    subscriptions.forEach((sub) => {
      const authors = authorsBySubscriber.get(sub.subscriberId);
      if (authors) {
        authors.push(sub.author);
      }
    });

    return subscriberIds.map((id) => authorsBySubscriber.get(id) || []);
  });

  const userPostsLoader = new DataLoader<string, Post[]>(async (authorIds) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          in: authorIds as string[],
        },
      },
    });

    const postsByAuthor = new Map<string, Post[]>();
    authorIds.forEach((id) => postsByAuthor.set(id, []));

    posts.forEach((post) => {
      const authorPosts = postsByAuthor.get(post.authorId);
      if (authorPosts) {
        authorPosts.push(post);
      }
    });

    return authorIds.map((id) => postsByAuthor.get(id) || []);
  });

  const userProfileLoader = new DataLoader<string, Profile | null>(async (userIds) => {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          in: userIds as string[],
        },
      },
    });

    const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));
    return userIds.map((id) => profileMap.get(id) || null);
  });

  const postAuthorLoader = new DataLoader<string, User | null>(async (postIds) => {
    const posts = await prisma.post.findMany({
      where: {
        id: {
          in: postIds as string[],
        },
      },
      include: {
        author: true,
      },
    });

    const authorMap = new Map(posts.map((post) => [post.id, post.author]));
    return postIds.map((id) => authorMap.get(id) || null);
  });

  return {
    userLoader,
    subscribersLoader,
    subscribedToLoader,
    userPostsLoader,
    userProfileLoader,
    postAuthorLoader,
  };
}
