
import * as fs from 'fs';
import * as readline from 'readline';

const filePath = process.argv[2] || 'logic_test_results.jsonl';

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

const entityStats: Record<string, { count: number, minScore: number, maxScore: number, totalConfidence: number }> = {};
let totalPaths = 0;
let suspiciousPaths: any[] = [];

const fileStream = fs.createReadStream(filePath);

const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

rl.on('line', (line) => {
    try {
        if (!line.trim()) return;
        const data = JSON.parse(line);
        totalPaths++;

        const entity = data.recommendedEntity || "UNKNOWN";
        const score = data.finalScores[entity] || 0;
        const confidence = data.confidenceScore || 0;

        if (!entityStats[entity]) {
            entityStats[entity] = { count: 0, minScore: Infinity, maxScore: -Infinity, totalConfidence: 0 };
        }

        const stats = entityStats[entity];
        stats.count++;
        stats.minScore = Math.min(stats.minScore, score);
        stats.maxScore = Math.max(stats.maxScore, score);
        stats.totalConfidence += confidence;

        // Check for suspicious things
        if (confidence < 50) {
            suspiciousPaths.push({ reason: "Low Confidence", ...data });
        }
        if (entity === "UNKNOWN") {
            suspiciousPaths.push({ reason: "Unknown Entity", ...data });
        }

        // Sample suspicious paths limit
        if (suspiciousPaths.length > 100) {
            // keep latest? or stop collecting to save memory
        }

    } catch (e) {
        // ignore parse errors
    }
});

rl.on('close', () => {
    console.log(`Total Paths Analyzed: ${totalPaths}`);
    console.table(Object.entries(entityStats).map(([entity, stats]) => ({
        Entity: entity,
        Count: stats.count,
        MinScore: stats.minScore,
        MaxScore: stats.maxScore,
        AvgConf: (stats.totalConfidence / stats.count).toFixed(2)
    })));

    if (suspiciousPaths.length > 0) {
        console.log("\nSuspicious Paths Sample (First 5):");
        console.log(JSON.stringify(suspiciousPaths.slice(0, 5), null, 2));
    } else {
        console.log("\nNo suspicious paths found (all confidence >= 50, valid entities).");
    }
});
