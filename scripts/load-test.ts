/**
 * Standalone Load Testing Script for Niaz Cloth House
 * Simulates concurrent patron traffic hitting the full-stack server
 */

async function runLoadTest() {
  const host = process.env.LOAD_TEST_HOST || 'http://localhost:3000';
  const concurrency = parseInt(process.env.CONCURRENCY || '10', 10);
  const totalRequests = parseInt(process.env.TOTAL_REQUESTS || '100', 10);
  const target = process.env.TARGET || 'cached-catalog';

  console.log('====================================================');
  console.log('🚀 NIAZ CLOTH HOUSE — LOAD TESTING & BENCHMARK SUITE');
  console.log(`Target: ${host}/api/load-test/run`);
  console.log(`Concurrency: ${concurrency} | Total Requests: ${totalRequests} | Mode: ${target}`);
  console.log('====================================================');

  try {
    const tStart = Date.now();
    const res = await fetch(`${host}/api/load-test/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concurrency, totalRequests, target }),
    });

    if (!res.ok) {
      throw new Error(`Load test returned HTTP ${res.status}: ${await res.text()}`);
    }

    const result = await res.json();
    const totalElapsed = Date.now() - tStart;

    console.log('\n📊 BENCHMARK RESULTS:');
    console.log(`• Status:            ✅ COMPLETED`);
    console.log(`• Total Requests:    ${result.totalRequests}`);
    console.log(`• Successful:        ${result.successCount}`);
    console.log(`• Failed:            ${result.errorCount}`);
    console.log(`• Execution Time:    ${result.durationMs} ms (Client round-trip: ${totalElapsed} ms)`);
    console.log(`• Throughput:        ${result.throughputRps} req/sec`);
    console.log('\n⏱️ LATENCY DISTRIBUTION:');
    console.log(`• Min Latency:       ${result.latency.min} ms`);
    console.log(`• Avg Latency:       ${result.latency.avg} ms`);
    console.log(`• p50 Median:        ${result.latency.p50} ms`);
    console.log(`• p95 Percentile:    ${result.latency.p95} ms`);
    console.log(`• p99 Percentile:    ${result.latency.p99} ms`);
    console.log(`• Max Latency:       ${result.latency.max} ms`);
    console.log('\n⚡ CACHE INTERCEPTION:');
    console.log(`• Hits Before:       ${result.cacheStats.hitsBefore}`);
    console.log(`• Hits After:        ${result.cacheStats.hitsAfter}`);
    console.log(`• Cache Hits Delta:  +${result.cacheStats.deltaHits}`);
    console.log('====================================================\n');
  } catch (err: any) {
    console.error('❌ Load test failed:', err.message || err);
    process.exit(1);
  }
}

runLoadTest();
