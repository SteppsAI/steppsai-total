# Export Architecture: Sync vs Async Strategy

## Problem Analysis

### Why is the current workflow so slow? (1-2 minutes)

It **should** take 5-10 seconds:
- Cloudflare REST API: 2-5 sec
- R2 upload: 1-2 sec  
- DB update: <1 sec

**Possible causes of slowness:**
1. ❌ Workflow overhead (cold start?)
2. ❌ Cloudflare API timeouts/errors
3. ❌ Network latency
4. ❌ HTML too large for API?

**Debug first step:** Check logs in Cloudflare Dashboard → Workflows → guide-pdf-export-workflow

---

## Proposal: **Adaptive Strategy** (smart!)

### Strategy: Start sync, fall back to async for large exports

```typescript
if (guide.steps.length <= 50) {
    // Sync: Direct download in 5-10 sec
    POST /exports/pdf → PDF blob → Download
} else {
    // Async: Queue job → Poll status → Download
    POST /exports/trigger → Workflow → Poll → Download
}
```

**Why this is smart:**
- ✅ 90% of exports are small → fast & simple
- ✅ Large exports go async → no timeout
- ✅ Best user experience per scenario

---

## Option 1: **Keep using Workflow** (current approach)

### Pros:
- ✅ Already implemented
- ✅ Built-in retries per step
- ✅ Scalable
- ✅ Persistent state - survives crashes
- ✅ Can run for minutes/hours

### Cons:
- ❌ Slow (why?)
- ❌ More expensive than queues

### Fix needed:
1. Debug why workflow takes 1-2 min
2. Optimize polling (24 sec interval, max 5 requests)
3. Better error handling

---

## Option 2: **Use Queue** (like recording-ingest)

### Architecture:
```
Frontend → TRPC → Queue.send({ guideId, format, htmlContent })
                         ↓
                  Queue Handler
                         ↓
        Cloudflare API → R2 → DB update
                         ↓
                  Frontend polls DB
```

### Pros:
- ✅ Faster than Workflow (less overhead)
- ✅ You already have queue setup
- ✅ Cheaper
- ✅ Dead letter queue for errors
- ✅ Retry mechanism

### Cons:
- ❌ Need to create new queue
- ❌ Need to write queue handler
- ❌ Timeout limits (30 sec CPU time)

### Implementation:
```jsonc
// wrangler.jsonc
"queues": {
    "consumers": [
        {
            "queue": "stepps-export-queue-stage",
            "dead_letter_queue": "stepps-export-dead-letter-stage",
            "max_retries": 3
        }
    ]
}
```

**Speed:** 5-10 seconds (queue overhead ~100ms vs workflow ~seconds)

---

## Option 3: **Hybrid: Sync for small, Queue/Workflow for large**

### Strategy decision tree:

```typescript
// export-dialog.tsx
const handleExport = async () => {
    const guide = await fetch(...);
    const htmlContent = renderToStaticMarkup(...);
    
    // Check size
    const estimatedSize = htmlContent.length + (guide.steps.length * 500000); // ~500KB per image
    const isSmall = guide.steps.length <= 50 || estimatedSize < 5_000_000; // 5MB
    
    if (isSmall) {
        // SYNC: Direct download
        const response = await fetch('/exports/pdf', { htmlContent });
        const blob = await response.blob();
        downloadFile(blob, `${guide.title}.pdf`);
        toast.success('PDF downloaded!');
    } else {
        // ASYNC: Workflow + poll
        await trpc.exports.triggerExport.mutate({ guideId, format, htmlContent });
        setIsPolling(true);
    }
};
```

**User Experience:**
- Small guide (1-50 steps): **Instant** download in 5-10 sec
- Large guide (50+ steps): Loading → Poll (max 5 requests) → Download

---

## Recommendation

### **Start with Option 1 (Workflow)** + Optimized Polling

**Why:**
1. Already implemented
2. User can click away - job keeps running
3. Perfect for large exports
4. Built-in state persistence

**Optimizations:**
1. ✅ Reduce polling: 5 requests max over 2 minutes (24 sec interval)
2. ✅ Better messaging: "Processing in background, refresh to check"
3. 🔍 Debug why workflow is slow

**If workflow stays slow:**
- Consider hybrid approach (sync for small, workflow for large)
- Or switch to queues (but lose long-running capability)

---

## Polling Optimization

**Current problem:**
- Too many requests
- No reasonable limit

**Fix:**
```typescript
// Max 5 requests over 2 minutes = 24 sec interval
const [pollCount, setPollCount] = useState(0);

const { data: guide } = useQuery({
    enabled: isPolling && pollCount < 5,
    refetchInterval: 24000, // 24 seconds
});

// Stop after 5 attempts
useEffect(() => {
    if (pollCount >= 5) {
        toast.info('Export processing in background. Refresh page to check status.');
    }
}, [pollCount]);
```

---

## Next Steps

1. ✅ Optimize polling (done: max 5 requests, 24 sec interval)
2. 🔍 Debug workflow performance in Cloudflare Dashboard
3. 📊 Monitor: How long do exports actually take?
4. 🎯 If needed: Implement adaptive strategy (sync for small)
