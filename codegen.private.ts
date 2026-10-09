import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/main/resources/graphql/private/*.graphqls',

  documents: 'src/main/resources/graphql/private/operations.graphqls',

  generates: {
    'src/app/core/graphql/private/types.ts': {
      plugins: ['typescript'],
    },
    'src/app/core/graphql/services.private.ts': {
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        importSchemaTypesFrom: 'src/app/core/graphql/private/types',
        addExplicitOverride: true,
      },
    },
  },
};

export default config;
