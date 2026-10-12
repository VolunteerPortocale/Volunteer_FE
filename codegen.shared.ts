import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/main/resources/graphql/shared/*.graphqls',

  generates: {
    'src/app/core/graphql/types.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
