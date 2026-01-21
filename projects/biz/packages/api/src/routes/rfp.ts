import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { db, interviewSteps, projects, rfpDocuments } from '../db';
import { rfpEngine } from '../services/ai/rfp-engine';

const app = new Hono();

app.get('/:projectId/rfp', async (c) => {
  const projectId = c.req.param('projectId');

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const [rfp] = await db
    .select()
    .from(rfpDocuments)
    .where(eq(rfpDocuments.projectId, projectId))
    .orderBy(rfpDocuments.createdAt);

  if (!rfp) {
    return c.json({ error: 'RFP not found' }, 404);
  }

  return c.json({
    ...rfp,
    content: JSON.parse(rfp.content),
  });
});

app.post('/:projectId/rfp/generate', async (c) => {
  const projectId = c.req.param('projectId');

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const steps = await db
    .select()
    .from(interviewSteps)
    .where(eq(interviewSteps.projectId, projectId));

  const rfpContent = await rfpEngine.generateRFP(project, steps);
  const completionRate = rfpEngine.calculateCompletionRate(rfpContent);

  const now = new Date().toISOString();
  const rfpId = nanoid();

  await db.insert(rfpDocuments).values({
    id: rfpId,
    projectId,
    version: '1.0',
    content: JSON.stringify(rfpContent),
    completionRate,
    createdAt: now,
    updatedAt: now,
  });

  await db
    .update(projects)
    .set({
      status: 'completed',
      completionRate,
      updatedAt: now,
    })
    .where(eq(projects.id, projectId));

  return c.json({
    id: rfpId,
    projectId,
    version: '1.0',
    content: rfpContent,
    completionRate,
    createdAt: now,
    updatedAt: now,
  });
});

app.get('/:projectId/rfp/preview', async (c) => {
  const projectId = c.req.param('projectId');

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const steps = await db
    .select()
    .from(interviewSteps)
    .where(eq(interviewSteps.projectId, projectId));

  const preview = rfpEngine.generatePreview(project, steps);

  return c.json(preview);
});

export default app;
