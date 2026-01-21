import { zValidator } from '@hono/zod-validator';
import { CreateProjectSchema, UpdateProjectSchema } from '@vyable/shared';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { db, projects } from '../db';

const app = new Hono();

app.get('/', async (c) => {
  const result = await db.select().from(projects).orderBy(projects.createdAt);
  return c.json(result);
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [project] = await db.select().from(projects).where(eq(projects.id, id));

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  return c.json(project);
});

app.post('/', zValidator('json', CreateProjectSchema), async (c) => {
  const data = c.req.valid('json');
  const now = new Date().toISOString();

  const newProject = {
    id: nanoid(),
    name: data.name,
    status: 'draft' as const,
    currentPhase: 'seed' as const,
    currentStep: 1,
    completionRate: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(projects).values(newProject);

  return c.json(newProject, 201);
});

app.patch('/:id', zValidator('json', UpdateProjectSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const [existing] = await db.select().from(projects).where(eq(projects.id, id));
  if (!existing) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const updated = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await db.update(projects).set(updated).where(eq(projects.id, id));

  const [result] = await db.select().from(projects).where(eq(projects.id, id));
  return c.json(result);
});

app.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const [existing] = await db.select().from(projects).where(eq(projects.id, id));
  if (!existing) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await db.delete(projects).where(eq(projects.id, id));

  return c.json({ success: true });
});

export default app;
