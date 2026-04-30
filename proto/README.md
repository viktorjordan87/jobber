# Proto generation

Generate TypeScript types from `.proto` files with `ts-proto`.

## Windows (PowerShell)

```powershell
npx protoc --plugin=protoc-gen-ts_proto=.\node_modules\.bin\protoc-gen-ts_proto.cmd --ts_proto_out=.\types .\proto\*.proto --ts_proto_opt=nestJs=true
```

## Linux/macOS (bash)

```bash
npx protoc --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true
```

Notes:

- Use `returns` (not `return`) in service RPC definitions.
- Windows must use `protoc-gen-ts_proto.cmd`.
