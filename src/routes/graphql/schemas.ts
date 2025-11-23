import { Type } from '@fastify/type-provider-typebox';
import { GraphQLSchema } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { RootQuery } from './types/queries.js';
import { RootMutation } from './types/mutations.js';
import { MemberTypeIdType } from './types/member.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
      operationName: Type.Optional(Type.String()),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
  types: [UUIDType, MemberTypeIdType],
});
