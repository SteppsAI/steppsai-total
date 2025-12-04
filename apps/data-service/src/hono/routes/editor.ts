import { Hono } from 'hono';

export const editorRouter = new Hono<{ Bindings: Env }>();

// GET /state - Get session state
editorRouter.get('/:guideId/state', async (c) => {
	const guideId = c.req.param('guideId');

	try {
		const stub = c.env.GUIDE_SESSION.get(c.env.GUIDE_SESSION.idFromName(guideId));

		// Ensure DO knows its guideId for auto-save functionality
		await stub.setGuideId(guideId);

		const result = await stub.getState();
		return c.json(result);
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Unknown error';
		console.error(`[Editor] Failed to get state for ${guideId}:`, msg);
		return c.json({ error: 'Failed to get session state', details: msg }, 500);
	}
});

// POST /update - Update draft
editorRouter.post('/:guideId/update', async (c) => {
	const guideId = c.req.param('guideId');

	try {
		const stub = c.env.GUIDE_SESSION.get(c.env.GUIDE_SESSION.idFromName(guideId));
		const data = await c.req.json();
		const result = await stub.updateState(data);
		return c.json(result);
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Unknown error';
		console.error(`[Editor] Failed to update state for ${guideId}:`, msg);
		return c.json({ error: 'Failed to update session', details: msg }, 500);
	}
});

// POST /save - Save to database
editorRouter.post('/:guideId/save', async (c) => {
	const guideId = c.req.param('guideId');

	try {
		const stub = c.env.GUIDE_SESSION.get(c.env.GUIDE_SESSION.idFromName(guideId));
		const result = await stub.saveToDb(guideId);
		console.log(`[Editor] Saved guide ${guideId} to database`);
		return c.json(result);
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Unknown error';
		console.error(`[Editor] Failed to save ${guideId} to database:`, msg);
		return c.json({ error: 'Failed to save to database', details: msg }, 500);
	}
});

// POST /discard - Discard draft
editorRouter.post('/:guideId/discard', async (c) => {
	const guideId = c.req.param('guideId');

	try {
		const stub = c.env.GUIDE_SESSION.get(c.env.GUIDE_SESSION.idFromName(guideId));
		const result = await stub.discard();
		console.log(`[Editor] Discarded draft for ${guideId}`);
		return c.json(result);
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Unknown error';
		console.error(`[Editor] Failed to discard draft for ${guideId}:`, msg);
		return c.json({ error: 'Failed to discard draft', details: msg }, 500);
	}
});
