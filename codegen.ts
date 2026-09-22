import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // 1. Where your schema files are:
  schema: [
    'src/main/resources/graphql/types.graphqls',
    'src/main/resources/graphql/queries.graphqls',
    'src/main/resources/graphql/mutation.graphqls',
  ],
  // 2. Where your operation requests are:
  documents: 'src/main/resources/graphql/operations/**/*.graphqls',
  // 3. What files to generate:
  generates: {
    // Generates the TypeScript interfaces (Types)
    'src/app/core/graphql/types.ts': {
      plugins: ['typescript'],
    },
    // Generates the Angular Apollo services (Services)
    'src/app/core/graphql/services.ts': {
      plugins: [
        'typescript-operations',
        'typescript-apollo-angular',
      ],
      config: {
        importSchemaTypesFrom: 'src/app/core/graphql/types',
        addExplicitOverride: true,
      },
    },
  },
};

export default config;