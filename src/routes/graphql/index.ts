import depthLimit from 'graphql-depth-limit';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { createLoaders } from './loaders.js';

const DEPTH_LIMIT = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables, operationName } = req.body;

      try {
        const parsedQuery = parse(query);
        const depthErrors = validate(schema, parsedQuery, [depthLimit(DEPTH_LIMIT)]);

        if (depthErrors.length > 0) {
          return { errors: depthErrors };
        }

        const context = {
          prisma,
          loaders: createLoaders(prisma),
        };

        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          operationName: operationName || undefined,
          contextValue: context,
        });

        return result;
      } catch (error) {
        return {
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
      }
    },
  });
};

export default plugin;
