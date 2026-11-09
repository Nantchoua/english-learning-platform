import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://azvolnguhxuoddjisxar.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.argv[2];
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'English';

if (!SUPABASE_KEY) {
  console.error('\n[ERROR] Missing Supabase API Key!');
  console.log('Usage:');
  console.log('  npx tsx scripts/upload_to_supabase.ts <YOUR_SUPABASE_KEY>');
  console.log('OR set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.\n');
  console.log('To get your key:');
  console.log('  1. Go to https://supabase.com/dashboard/project/azvolnguhxuoddjisxar/settings/api');
  console.log('  2. Copy the "service_role" (secret) or "anon" (public) key.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function listAllFiles(folder: string): Promise<Set<string>> {
  const existing = new Set<string>();
  let offset = 0;
  const limit = 100;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder, {
      limit,
      offset,
    });
    if (error) {
      console.warn(`[Warning] Could not list ${folder}: ${error.message}`);
      break;
    }
    if (!data || data.length === 0) break;
    for (const item of data) {
      if (item.name) {
        existing.add(`${folder}/${item.name}`);
      }
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return existing;
}

async function uploadDirectory(localDir: string, remoteFolder: string, contentType: string) {
  if (!fs.existsSync(localDir)) {
    console.log(`[Skip] Directory not found: ${localDir}`);
    return;
  }

  const files = fs.readdirSync(localDir).filter(f => !f.startsWith('.'));
  console.log(`\nScanning ${files.length} files in ${localDir}...`);

  const existingFiles = await listAllFiles(remoteFolder);
  console.log(`Found ${existingFiles.size} existing files already in Supabase bucket '${BUCKET_NAME}/${remoteFolder}'.`);

  let uploadedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const localFilePath = path.join(localDir, file);
    const remoteFilePath = `${remoteFolder}/${file}`;

    if (existingFiles.has(remoteFilePath)) {
      skippedCount++;
      continue;
    }

    const stat = fs.statSync(localFilePath);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    const progress = `[${i + 1}/${files.length}]`;

    process.stdout.write(`${progress} Uploading ${file} (${sizeMb} MB)... `);

    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(remoteFilePath, fileBuffer, {
        contentType,
        upsert: true,
      });

      if (error) {
        process.stdout.write(`FAILED: ${error.message}\n`);
        errorCount++;
      } else {
        process.stdout.write(`OK\n`);
        uploadedCount++;
      }
    } catch (err: any) {
      process.stdout.write(`ERROR: ${err.message}\n`);
      errorCount++;
    }
  }

  console.log(`\n--- Completed ${remoteFolder} ---`);
  console.log(`  Uploaded: ${uploadedCount}`);
  console.log(`  Skipped (already exist): ${skippedCount}`);
  console.log(`  Failed: ${errorCount}`);
}

async function main() {
  console.log('====================================================');
  console.log(' Oxford Beginner Course - Supabase Media Uploader ');
  console.log('====================================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Bucket:       ${BUCKET_NAME}`);

  // 1. Upload Audios (247 files)
  const audioDir = path.resolve(process.cwd(), 'public', 'audio', 'beginner');
  await uploadDirectory(audioDir, 'audio/beginner', 'audio/mpeg');

  // 2. Upload Videos (55 files)
  const videoDir = path.resolve(process.cwd(), 'public', 'videos', 'beginner');
  await uploadDirectory(videoDir, 'videos/beginner', 'video/mp4');

  console.log('\nAll uploads finished!');
  console.log(`Your files are accessible publicly at:`);
  console.log(`  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/audio/beginner/...`);
  console.log(`  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/videos/beginner/...`);
  console.log('Next.js is already configured to automatically rewrite /audio/* and /videos/* to these URLs.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
