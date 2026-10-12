import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    'src/main/resources/graphql/shared/*.graphqls',
    'src/main/resources/graphql/public/queries.graphqls',
    'src/main/resources/graphql/public/mutations.graphqls',
  ],

  documents: 'src/main/resources/graphql/public/operations.graphqls',

  generates: {
    'src/app/core/graphql/services.public.ts': {
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        importSchemaTypesFrom: 'src/app/core/graphql/types',
        addExplicitOverride: true,
        namedClient: 'public',
      },
    },
  },
};

export default config;
