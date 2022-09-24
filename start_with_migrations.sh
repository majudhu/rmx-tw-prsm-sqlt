#!/bin/sh

set -ex
pnpm prisma migrate deploy
pnpm start
