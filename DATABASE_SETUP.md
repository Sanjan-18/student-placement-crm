# Database setup

This project uses Prisma `db push` for the cumulative local development database because
the project source does not include the historical migration chain required by `migrate dev`.

Run:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Do not run `npx prisma migrate dev` against this cumulative build.

`db push` will create/sync the `acceptedOfferCount` field from the current Prisma schema,
including all previously existing CRM tables and relations.
