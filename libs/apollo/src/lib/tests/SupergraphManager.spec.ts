import { GetDataSourceFunction } from '@apollo/gateway';
import { SchemaManager } from '../SupergraphManager';

const instrospectResponse = {
  data: {
    _service: {
      sdl:
        'directive @key(fields: String!, resolvable: Boolean = true) repeatable on OBJECT | INTERFACE\n' +
        '\n' +
        'directive @extends on OBJECT | INTERFACE\n' +
        '\n' +
        'directive @external on OBJECT | FIELD_DEFINITION\n' +
        '\n' +
        'directive @requires(fields: String!) on FIELD_DEFINITION\n' +
        '\n' +
        'directive @provides(fields: String!) on FIELD_DEFINITION\n' +
        '\n' +
        'directive @shareable on FIELD_DEFINITION | OBJECT\n' +
        '\n' +
        'directive @link(url: String!, import: [link__Import]) on SCHEMA\n' +
        '\n' +
        'directive @tag(name: String!) repeatable on FIELD_DEFINITION | OBJECT | INTERFACE | UNION | ARGUMENT_DEFINITION | SCALAR | ENUM | ENUM_VALUE | INPUT_OBJECT | INPUT_FIELD_DEFINITION\n' +
        '\n' +
        'directive @inaccessible on FIELD_DEFINITION | OBJECT | INTERFACE | UNION | ARGUMENT_DEFINITION | SCALAR | ENUM | ENUM_VALUE | INPUT_OBJECT | INPUT_FIELD_DEFINITION\n' +
        '\n' +
        'directive @override(from: String!) on FIELD_DEFINITION\n' +
        '\n' +
        'type PostModel {\n' +
        '  id: Int!\n' +
        '  title: String!\n' +
        '  body: String!\n' +
        '}\n' +
        '\n' +
        'type Query {\n' +
        '  posts: [PostModel!]!\n' +
        '  _service: _Service!\n' +
        '}\n' +
        '\n' +
        'scalar link__Import\n' +
        '\n' +
        'scalar _FieldSet\n' +
        '\n' +
        'scalar _Any\n' +
        '\n' +
        'type _Service {\n' +
        '  sdl: String\n' +
        '}',
    },
  },
};

describe('SchemaManager', () => {
  let schemaManager: any;
  beforeEach(() => {
    schemaManager = new SchemaManager();
  });

  describe('addSubgraph', () => {
    it('adds a new subgraph to the list of services', async () => {
      const service = {
        name: 'test-service',
        url: 'http://test-service.com/graphql',
      };
      const getDataSource: GetDataSourceFunction = () => ({
        process: jest.fn(() => Promise.resolve({ data: instrospectResponse.data, errors: [] })),
      });
      schemaManager.initialize({
        getDataSource,
      });
      await schemaManager.addSubgraph(service);
      expect(schemaManager.services.size).toEqual(1);
      expect(schemaManager.services.get('test-service')).toEqual(expect.objectContaining(service));
    });
  });

  describe('removeSchema', () => {
    it('removes a subgraph from the list of services', async () => {
      const service = {
        name: 'test-service',
        url: 'http://test-service.com/graphql',
        dataSource: {
          process: jest.fn(() => Promise.resolve({ data: instrospectResponse.data, errors: [] })),
        },
      };
      schemaManager.services.set(service.name, service);
      await schemaManager.removeSchema(service);
      expect(schemaManager.services.size).toEqual(0);
    });
  });

  describe('initialize', () => {
    let supergraphSdlHookOptions;
    beforeEach(() => {
      supergraphSdlHookOptions = {
        healthCheck: jest.fn(() => Promise.resolve()),
        update: jest.fn(),
        getDataSource: jest.fn(() => ({
          process: jest.fn(() => Promise.resolve({ data: instrospectResponse.data, errors: [] })),
        })),
      };
    });

    it('builds the super graph for the current service definition', async () => {
      const service = {
        name: 'test-service',
        url: 'http://test-service.com/graphql',
        dataSource: {
          process: jest.fn(() => Promise.resolve({ data: instrospectResponse.data })),
        },
      };
      schemaManager.services.set(service.name, service);
      await schemaManager.initialize(supergraphSdlHookOptions);
      expect(schemaManager.initialized).toBeTruthy();
    });
  });
});
