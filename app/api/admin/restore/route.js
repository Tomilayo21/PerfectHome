// // app/api/admin/restore/route.js
// import { NextResponse } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
// import unzipper from 'unzipper';
// import { spawn } from 'child_process';

// const AUTH_PASSWORD = process.env.RESTORE_PASSWORD || 'admin123'; // Use .env for security

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const password = formData.get('password');
//     const file = formData.get('file');

//     if (password !== AUTH_PASSWORD) {
//       return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
//     }

//     if (!file || !file.name.endsWith('.zip')) {
//       return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
//     }

//     const tempDir = path.join(process.cwd(), 'tmp');
//     const zipPath = path.join(tempDir, file.name);
//     const restorePath = path.join(tempDir, 'restore');

//     await mkdir(tempDir, { recursive: true });

//     const bytes = await file.arrayBuffer();
//     await writeFile(zipPath, Buffer.from(bytes));

//     // Extract zip
//     await new Promise((resolve, reject) => {
//       const stream = unzipper.Extract({ path: restorePath });
//       stream.on('close', resolve);
//       stream.on('error', reject);

//       require('fs')
//         .createReadStream(zipPath)
//         .pipe(stream);
//     });

//     // Run mongorestore
//     const restore = spawn('mongorestore', ['--drop', '--dir', restorePath]);

//     await new Promise((resolve, reject) => {
//       restore.on('close', (code) => {
//         if (code === 0) resolve();
//         else reject(new Error('mongorestore failed'));
//       });
//     });

//     return NextResponse.json({ success: true, message: 'Database restored successfully' });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: error.message || 'Restore failed' }, { status: 500 });
//   }
// }























// import { NextResponse } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
// import os from 'os';
// import { spawn } from 'child_process';
// import { parse } from 'formidable';
// import { Readable } from 'stream';

// // Disable Next.js default body parser
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // Helper to convert a Request into a form data stream
// const streamRequestToBuffer = async (req) => {
//   const buffers = [];
//   for await (const chunk of req.body) {
//     buffers.push(chunk);
//   }
//   return Buffer.concat(buffers);
// };

// export async function POST(req) {
//   try {
//     const contentType = req.headers.get('content-type') || '';
//     if (!contentType.includes('multipart/form-data')) {
//       return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
//     }

//     const boundary = contentType.split('boundary=')[1];
//     const busboy = (await import('busboy')).default;
//     const bb = busboy({ headers: { 'content-type': contentType } });

//     const fields = {};
//     let uploadedFilePath = '';

//     const reqBody = await streamRequestToBuffer(req);

//     const stream = Readable.from(reqBody);
//     stream.pipe(bb);

//     await new Promise((resolve, reject) => {
//       bb.on('file', async (fieldname, file, filename) => {
//         const uploadDir = path.join(os.tmpdir(), 'restore');
//         await mkdir(uploadDir, { recursive: true });
//         const filePath = path.join(uploadDir, filename);
//         const buffer = await fileToBuffer(file);
//         await writeFile(filePath, buffer);
//         uploadedFilePath = filePath;
//       });

//       bb.on('field', (fieldname, val) => {
//         fields[fieldname] = val;
//       });

//       bb.on('finish', resolve);
//       bb.on('error', reject);
//     });

//     const { password } = fields;

//     if (password !== process.env.RESTORE_PASSWORD) {
//       return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
//     }

//     if (!uploadedFilePath) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const unzipDir = uploadedFilePath.replace('.zip', '');

//     // Step 1: Unzip backup
//     await unzipBackup(uploadedFilePath, unzipDir);

//     // Step 2: Restore using mongorestore
//     await runMongorestore(unzipDir);

//     return NextResponse.json({ message: 'Restore complete' });
//   } catch (err) {
//     console.error('Restore error:', err);
//     return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
//   }
// }

// // Convert file stream to buffer
// const fileToBuffer = (file) =>
//   new Promise((resolve, reject) => {
//     const chunks = [];
//     file.on('data', (chunk) => chunks.push(chunk));
//     file.on('end', () => resolve(Buffer.concat(chunks)));
//     file.on('error', reject);
//   });

// // Unzip .zip file using PowerShell
// const unzipBackup = (zipPath, destPath) =>
//   new Promise((resolve, reject) => {
//     const unzip = spawn('powershell.exe', [
//       '-Command',
//       `Expand-Archive -Path "${zipPath}" -DestinationPath "${destPath}" -Force`,
//     ]);

//     unzip.on('close', (code) => {
//       if (code === 0) {
//         resolve();
//       } else {
//         reject(new Error('Failed to unzip backup'));
//       }
//     });
//   });

// // Run mongorestore from unzip folder
// const runMongorestore = (sourcePath) =>
//   new Promise((resolve, reject) => {
//     const restore = spawn('C:\\Users\\Ify-Laptop\\Desktop\\MongoDB\\Tools\\100\\bin\\mongorestore.exe', [
//       '--drop',
//       '--dir',
//       sourcePath,
//     ]);

//     restore.stdout.on('data', (data) => console.log('mongorestore:', data.toString()));
//     restore.stderr.on('data', (data) => console.error('mongorestore error:', data.toString()));

//     restore.on('close', (code) => {
//       if (code === 0) {
//         resolve();
//       } else {
//         reject(new Error('mongorestore failed'));
//       }
//     });
//   });




























// import { NextResponse } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
// import os from 'os';
// import { spawn } from 'child_process';
// import { Readable } from 'stream';

// // Disable body parsing
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // Stream buffer helper
// const streamRequestToBuffer = async (req) => {
//   const chunks = [];
//   for await (const chunk of req.body) {
//     chunks.push(chunk);
//   }
//   return Buffer.concat(chunks);
// };

// // Convert file stream to buffer
// const fileToBuffer = (file) =>
//   new Promise((resolve, reject) => {
//     const chunks = [];
//     file.on('data', (chunk) => chunks.push(chunk));
//     file.on('end', () => resolve(Buffer.concat(chunks)));
//     file.on('error', reject);
//   });

// // PowerShell unzip
// const unzipBackup = (zipPath, destPath) =>
//   new Promise((resolve, reject) => {
//     const unzip = spawn('powershell.exe', [
//       '-Command',
//       `Expand-Archive -Path "${zipPath}" -DestinationPath "${destPath}" -Force`,
//     ]);

//     unzip.on('close', (code) => {
//       code === 0 ? resolve() : reject(new Error('Failed to unzip backup'));
//     });
//   });

// // mongorestore call
// const runMongorestore = (sourcePath) =>
//   new Promise((resolve, reject) => {
//     const restore = spawn('C:\\Users\\Ify-Laptop\\Desktop\\MongoDB\\Tools\\100\\bin\\mongorestore.exe', [
//       '--drop',
//       '--dir',
//       sourcePath,
//     ]);

//     restore.stdout.on('data', (data) => console.log('mongorestore:', data.toString()));
//     restore.stderr.on('data', (data) => console.error('mongorestore error:', data.toString()));

//     restore.on('close', (code) => {
//       code === 0 ? resolve() : reject(new Error('mongorestore failed'));
//     });
//   });

// export async function POST(req) {
//   try {
//     const contentType = req.headers.get('content-type') || '';
//     if (!contentType.includes('multipart/form-data')) {
//       return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
//     }

//     const boundary = contentType.split('boundary=')[1];
//     const busboy = (await import('busboy')).default;
//     const bb = busboy({ headers: { 'content-type': contentType } });

//     const fields = {};
//     let uploadedFilePath = '';

//     const reqBody = await streamRequestToBuffer(req);
//     const stream = Readable.from(reqBody);
//     stream.pipe(bb);

//     await new Promise((resolve, reject) => {
//       bb.on('file', async (fieldname, file, info) => {
//         try {
//           const uploadDir = path.join(os.tmpdir(), 'restore');
//           await mkdir(uploadDir, { recursive: true });

//           const filename = typeof info.filename === 'string'
//             ? info.filename
//             : `upload-${Date.now()}.zip`;

//           const filePath = path.join(uploadDir, filename);
//           const buffer = await fileToBuffer(file);
//           await writeFile(filePath, buffer);
//           uploadedFilePath = filePath;
//           resolve();
//         } catch (err) {
//           reject(err);
//         }
//       });

//       bb.on('field', (fieldname, val) => {
//         fields[fieldname] = val;
//       });

//       bb.on('finish', resolve);
//       bb.on('error', reject);
//     });

//     const { password } = fields;

//     if (password !== process.env.RESTORE_PASSWORD) {
//       return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
//     }

//     if (!uploadedFilePath) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const unzipDir = uploadedFilePath.replace(/\.zip$/i, '');

//     await unzipBackup(uploadedFilePath, unzipDir);
//     await runMongorestore(unzipDir);

//     return NextResponse.json({ message: 'Restore complete' });
//   } catch (err) {
//     console.error('Restore error:', err);
//     return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
//   }
// }



















// import { NextResponse } from 'next/server';
// import { mkdir, writeFile } from 'fs/promises';
// import path from 'path';
// import os from 'os';
// import unzipper from 'unzipper';
// import { spawn } from 'child_process';
// import { Readable } from 'stream';

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('file');

//     if (!file || typeof file === 'string') {
//       return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
//     }

//     // Create temp upload directory
//     const uploadDir = path.join(os.tmpdir(), 'restore');
//     await mkdir(uploadDir, { recursive: true });

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const zipPath = path.join(uploadDir, 'upload.zip');
//     await writeFile(zipPath, buffer);

//     // Extract the zip
//     const extractDir = path.join(uploadDir, 'unzipped');
//     await mkdir(extractDir, { recursive: true });

//     await new Promise((resolve, reject) => {
//       Readable.from(buffer)
//         .pipe(unzipper.Extract({ path: extractDir }))
//         .on('close', resolve)
//         .on('error', reject);
//     });

//     // Run mongorestore
//     const restore = spawn('mongorestore', ['--drop', extractDir], {
//       shell: true,
//     });

//     restore.stdout.on('data', (data) => console.log(`stdout: ${data}`));
//     restore.stderr.on('data', (data) => console.error(`stderr: ${data}`));

//     const exitCode = await new Promise((resolve) => {
//       restore.on('close', resolve);
//     });

//     if (exitCode !== 0) {
//       return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, message: 'Database restored successfully.' });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }





















// import { NextResponse } from 'next/server';
// import { mkdir, writeFile } from 'fs/promises';
// import path from 'path';
// import os from 'os';
// import unzipper from 'unzipper';
// import { spawn } from 'child_process';
// import { Readable } from 'stream';

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('file');

//     if (!file || typeof file === 'string') {
//       return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
//     }

//     // Create temp upload directory
//     const uploadDir = path.join(os.tmpdir(), 'restore');
//     await mkdir(uploadDir, { recursive: true });

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const zipPath = path.join(uploadDir, 'upload.zip');
//     await writeFile(zipPath, buffer);

//     // Extract the zip
//     const extractDir = path.join(uploadDir, 'unzipped');
//     await mkdir(extractDir, { recursive: true });

//     await new Promise((resolve, reject) => {
//       Readable.from(buffer)
//         .pipe(unzipper.Extract({ path: extractDir }))
//         .on('close', resolve)
//         .on('error', reject);
//     });

//     // Windows full path to mongorestore.exe
//     const mongorestorePath = `"C:\\Users\\Ify-Laptop\\Desktop\\MongoDB\\Tools\\100\\bin\\mongorestore.exe"`;

//     const restore = spawn(mongorestorePath, ['--drop', extractDir], {
//       shell: true,
//     });

//     restore.stdout.on('data', (data) => console.log(`stdout: ${data}`));
//     restore.stderr.on('data', (data) => console.error(`stderr: ${data}`));

//     const exitCode = await new Promise((resolve) => {
//       restore.on('close', resolve);
//     });

//     if (exitCode !== 0) {
//       return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, message: 'Database restored successfully.' });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
























// /app/api/admin/restore/route.js
import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import os from 'os';
import unzipper from 'unzipper';
import { spawn } from 'child_process';
import { Readable } from 'stream';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
    }

    // Create temporary upload directory
    const uploadDir = path.join(os.tmpdir(), 'restore');
    await mkdir(uploadDir, { recursive: true });

    // Save uploaded zip file
    const buffer = Buffer.from(await file.arrayBuffer());
    const zipPath = path.join(uploadDir, 'upload.zip');
    await writeFile(zipPath, buffer);

    // Extract the zip file
    const extractDir = path.join(uploadDir, 'unzipped');
    await mkdir(extractDir, { recursive: true });

    await new Promise((resolve, reject) => {
      Readable.from(buffer)
        .pipe(unzipper.Extract({ path: extractDir }))
        .on('close', resolve)
        .on('error', reject);
    });

    // Path to mongorestore.exe on Windows
    const mongorestorePath = `"C:\\Users\\Ify-Laptop\\Desktop\\MongoDB\\Tools\\100\\bin\\mongorestore.exe"`;

    // Spawn mongorestore process
    const restore = spawn(mongorestorePath, ['--drop', extractDir], {
      shell: true,
    });

    restore.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    restore.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    const exitCode = await new Promise((resolve) => {
      restore.on('close', resolve);
    });

    if (exitCode !== 0) {
      return NextResponse.json({ error: 'Restore failed. Please check the server logs.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Database restored successfully.' });
  } catch (err) {
    console.error('Restore error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
