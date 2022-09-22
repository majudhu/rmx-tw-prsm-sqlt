import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';

import type { LoaderArgs, ActionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  const logs = await db.healthCheck.findMany();

  return json({
    logs: logs.map(({ headers, ...rest }) => ({
      ...rest,
      headers: JSON.parse(headers) as Record<string, string>,
    })),
  });
}

export async function action({ request }: ActionArgs) {
  await db.healthCheck.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 60 * 1000) } },
  });
  await db.healthCheck.create({
    data: {
      headers: JSON.stringify(Object.fromEntries(request.headers)),
      body: await request.text(),
    },
  });
  return new Response("", { status: 204 });
}

export default function Index() {
  const { logs } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-md mx-auto space-y-2">
      <h1 className="font-bold text-4xl">
        Remix-Tailwind-Prisma-SQLite-Fly.io
      </h1>
      {logs.map(({ id, createdAt, headers, body }) => (
        <div key={id} className="border border-black p-1">
          <p className="border-b">{createdAt}</p>
          {Object.entries(headers).map(([key, value]) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
          <pre className="border-t">{body}</pre>
        </div>
      ))}
    </div>
  );
}
