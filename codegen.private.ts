import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    'src/main/resources/graphql/shared/*.graphqls',
    'src/main/resources/graphql/private/queries.graphqls',
    'src/main/resources/graphql/private/mutations.graphqls',
  ],

  documents: 'src/main/resources/graphql/private/operations.graphqls',

  generates: {
    'src/app/core/graphql/services.private.ts': {
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        importSchemaTypesFrom: 'src/app/core/graphql/types',
        addExplicitOverride: true,
      },
    },
  },
};

export default config;
