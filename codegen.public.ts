import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/main/resources/graphql/public/*.graphqls',

  generates: {
    'src/app/core/graphql/public/types.ts': {
      plugins: ['typescript'],
    },

    'src/app/core/graphql/services.public.ts': {
      documents: 'src/main/resources/graphql/public/operations.graphqls',

      plugins: ['typescript-operations', 'typescript-apollo-angular'],

      config: {
        importSchemaTypesFrom: 'src/app/core/graphql/public/types',
        addExplicitOverride: true,
        client: 'public',
      },
    },
  },
};

export default config;
