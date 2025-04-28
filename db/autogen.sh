#!/bin/bash

if [[ ! -d "../mobile/lib/autogen" ]]; then
  mkdir -p ../mobile/lib/autogen
fi

if [[ ! -d "../web/app/lib/autogen" ]]; then
  mkdir -p ../web/app/lib/autogen
fi

cp ./database.types.ts ../mobile/lib/autogen/database.types.ts
cp ./database.types.ts ../web/app/lib/autogen/database.types.ts

cp ./queries.ts ../mobile/lib/autogen/queries.ts
cp ./queries.ts ../web/app/lib/autogen/queries.ts