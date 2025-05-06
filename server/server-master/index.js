// // // // // server-master/index.js
// // // // const express    = require('express');
// // // // const fs         = require('fs').promises;
// // // // const { execFile } = require('child_process');
// // // // const path       = require('path');
// // // // const app        = express();
// // // // const PORT       = process.env.PORT || 3000;

// // // // app.use(express.json());
// // // // app.use((req, res, next) => {
// // // //   res.header('Access-Control-Allow-Origin', '*');
// // // //   res.header('Access-Control-Allow-Headers', 'Content-Type');
// // // //   next();
// // // // });

// // // // app.post('/run-esbmc', async (req, res) => {
// // // //   const { code, unwind = '1000' } = req.body;
// // // //   if (typeof code !== 'string') {
// // // //     return res.status(400).json({ error: 'Invalid `code` in request' });
// // // //   }

// // // //   // 1) write your C snippet to a temp .c file
// // // //   const tmpFile = path.join(__dirname, `input-${Date.now()}.c`);
// // // //   try {
// // // //     await fs.writeFile(tmpFile, code);
// // // //   } catch (e) {
// // // //     return res.status(500).json({ error: `Failed to write temp file: ${e}` });
// // // //   }

// // // //   // 2) build ESBMC arguments
// // // //   const args = [
// // // //     tmpFile,
// // // //     '--unwind', unwind,
// // // //     '--no-unwinding-assertions',
// // // //     '--overflow-check',
// // // //     '--unsigned-overflow-check',
// // // //     '--memory-leak-check',
// // // //     '--ub-shift-check',
// // // //     '--struct-fields-check',
// // // //     '--nan-check',
// // // //     // optionally enable concurrency checks *only* if needed:
// // // //     '--deadlock-check',
// // // //     '--data-races-check',
// // // //     '--lock-order-check',
// // // //     '--atomicity-check',
// // // //   ];
  
// // // //   // 3) invoke ESBMC
// // // //   execFile('esbmc', args, { timeout: 30000 }, (err, stdout, stderr) => {
// // // //     // clean up
// // // //     fs.unlink(tmpFile).catch(() => {});
  
// // // //     const lines = (stdout || '').split(/\r?\n/);
// // // //     const summaryLines = [];
// // // //     let captureFailure = false;
  
// // // //     for (let i = 0; i < lines.length; i++) {
// // // //       const line = lines[i].trim();
  
// // // //       // 1) “file … function” → start of the violation block
// // // //       if (/^file\s.+function\s.+/.test(line)) {
// // // //         summaryLines.push(line);
// // // //         captureFailure = true;
// // // //         continue;
// // // //       }
  
// // // //       // 2) If we're in the failure block, grab the indented message
// // // //       if (captureFailure) {
// // // //         if (line === '') {
// // // //           captureFailure = false;
// // // //         } else {
// // // //           summaryLines.push(line);
// // // //         }
// // // //       }
  
// // // //       // 3) Grab the final VERIFICATION result
// // // //       if (/^VERIFICATION\s(?:FAILED|SUCCESSFUL)/.test(line)) {
// // // //         summaryLines.push(line);
// // // //       }
// // // //     }
  
// // // //     // Fallback if nothing was captured
// // // //     const summary = summaryLines.length
// // // //       ? summaryLines.join('\n')
// // // //       : 'No violation detected.';
  
// // // //     res.json({
// // // //       exitCode: err?.code ?? 0,
// // // //       summary,
// // // //       stdout,
// // // //       stderr
// // // //     });
// // // //   });
  
// // // // });

// // // // app.listen(PORT, () => {
// // // //   console.log(`ESBMC server listening on http://localhost:${PORT}`);
// // // // });


// // // // server-master/index.js

// // // const express     = require('express');
// // // const fs          = require('fs').promises;
// // // const { execFile } = require('child_process');
// // // const path        = require('path');

// // // const app  = express();
// // // const PORT = process.env.PORT || 3000;

// // // app.use(express.json());
// // // app.use((req, res, next) => {
// // //   res.header('Access-Control-Allow-Origin', '*');
// // //   res.header('Access-Control-Allow-Headers', 'Content-Type');
// // //   next();
// // // });

// // // app.post('/run-esbmc', async (req, res) => {
// // //   const { code, unwind = '10' } = req.body;
// // //   if (typeof code !== 'string') {
// // //     return res.status(400).json({ error: 'Invalid `code` in request' });
// // //   }

// // //   // write code to temp file
// // //   const tmpFile = path.join(__dirname, `input-${Date.now()}.c`);
// // //   try {
// // //     await fs.writeFile(tmpFile, code);
// // //   } catch (e) {
// // //     return res.status(500).json({ error: `Failed to write temp file: ${e}` });
// // //   }

// // //   // ESBMC with memory‐leak + overflow checks
// // //   const args = [
// // //     tmpFile,
// // //     '--unwind', unwind,
// // //     '--no-unwinding-assertions',
// // //     '--overflow-check',
// // //     '--unsigned-overflow-check',
// // //     '--memory-leak-check'
// // //   ];

// // //   execFile('esbmc', args, { timeout: 30000 }, (err, stdout, stderr) => {
// // //     // cleanup
// // //     fs.unlink(tmpFile).catch(() => {});

// // //     // pick the non-empty stream
// // //     const outputText = (stderr && stderr.trim()) ? stderr : stdout;
// // //     const lines = outputText.split(/\r?\n/);
// // //     const summaryLines = [];

// // //     // extract any “failure:” and context
// // //     for (let i = 0; i < lines.length; i++) {
// // //       const l = lines[i].trim();
// // //       if (/failure:/i.test(l)) {
// // //         // grab preceding file/function line if present
// // //         const prev = lines[i - 1]?.trim() || '';
// // //         if (/^file\s.+function\s.+/i.test(prev)) {
// // //           summaryLines.push(prev);
// // //         }
// // //         summaryLines.push(l);
// // //       }
// // //       // always capture the final VERIFICATION result
// // //       if (/^VERIFICATION\s+(FAILED|SUCCESSFUL)/.test(l)) {
// // //         summaryLines.push(l);
// // //       }
// // //     }

// // //     // only send summary if we found something
// // //     const summary = summaryLines.length ? summaryLines.join('\n') : null;

// // //     res.json({
// // //       exitCode: err?.code ?? 0,
// // //       summary,    // null if nothing extracted
// // //       stdout,
// // //       stderr,
// // //     });
// // //   });
// // // });

// // // app.listen(PORT, () => {
// // //   console.log(`ESBMC server listening on http://localhost:${PORT}`);
// // // });

// // // server-master/index.js
// // require('dotenv').config();           // ← add this as the FIRST line
// // console.log('OpenAI key:', process.env.OPENAI_API_KEY ? '✔️ loaded' : '❌ missing');

// // const express       = require('express');
// // const fs            = require('fs').promises;
// // const { execFile }  = require('child_process');
// // const path          = require('path');
// // const { Configuration, OpenAIApi } = require('openai');
// // // … rest of your imports …

// // const app  = express();
// // const PORT = process.env.PORT || 3000;

// // app.use(express.json());
// // app.use((req, res, next) => {
// //   res.header('Access-Control-Allow-Origin', '*');
// //   res.header('Access-Control-Allow-Headers', 'Content-Type');
// //   next();
// // });

// // // ESBMC verification endpoint
// // app.post('/run-esbmc', async (req, res) => {
// //   const { code, unwind = '10' } = req.body;
// //   if (typeof code !== 'string') {
// //     return res.status(400).json({ error: 'Invalid `code` in request' });
// //   }

// //   const tmpFile = path.join(__dirname, `input-${Date.now()}.c`);
// //   try {
// //     await fs.writeFile(tmpFile, code);
// //   } catch (e) {
// //     return res.status(500).json({ error: `Failed to write temp file: ${e}` });
// //   }

// //   const args = [
// //     tmpFile,
// //     '--unwind', unwind,
// //     '--no-unwinding-assertions',
// //     '--overflow-check',
// //     '--unsigned-overflow-check',
// //     '--memory-leak-check'
// //   ];

// //   execFile('esbmc', args, { timeout: 30000 }, (err, stdout, stderr) => {
// //     fs.unlink(tmpFile).catch(() => {});
// //     const outputText = (stderr && stderr.trim()) ? stderr : stdout;
// //     const lines = outputText.split(/\r?\n/);
// //     const summaryLines = [];
// //     for (let i = 0; i < lines.length; i++) {
// //       const l = lines[i].trim();
// //       if (/failure:/i.test(l)) {
// //         const prev = lines[i - 1]?.trim() || '';
// //         if (/^file\s.+function\s.+/i.test(prev)) {
// //           summaryLines.push(prev);
// //         }
// //         summaryLines.push(l);
// //       }
// //       if (/^VERIFICATION\s+(FAILED|SUCCESSFUL)/.test(l)) {
// //         summaryLines.push(l);
// //       }
// //     }
// //     const summary = summaryLines.length ? summaryLines.join('\n') : null;

// //     res.json({
// //       exitCode: err?.code ?? 0,
// //       summary,
// //       stdout,
// //       stderr,
// //     });
// //   });
// // });

// // // Suggest code fix endpoint
// // app.post('/suggest-fix', async (req, res) => {
// //   console.log('[/suggest-fix] incoming body:', req.body);

// //   const { code, summary } = req.body;
// //   if (typeof code !== 'string' || typeof summary !== 'string') {
// //     console.error('Invalid payload:', req.body);
// //     return res.status(400).json({ error: '`code` and `summary` are required strings' });
// //   }

// //   const prompt = `
// // You are a C expert. Here is some C code that ESBMC reported errors on:

// // === Code ===
// // ${code}

// // === ESBMC Error Summary ===
// // ${summary}

// // Make the minimal edits needed to fix the code so that ESBMC no longer reports that error.
// // Return ONLY the corrected C code.
// // `;

// //   try {
// //     const conf   = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
// //     const client = new OpenAIApi(conf);
// //     const chat   = await client.createChatCompletion({
// //       model: 'gpt-4o-mini',
// //       messages: [
// //         { role: 'system', content: 'Suggest minimal C code edits.' },
// //         { role: 'user',   content: prompt }
// //       ],
// //       temperature: 0.0
// //     });

// //     const fix = chat.data.choices?.[0]?.message?.content?.trim();
// //     console.log('[/suggest-fix] got fix:', fix);
// //     return res.json({ fix });
// //   } catch (err) {
// //     console.error('[/suggest-fix] error:', err);
// //     return res.status(500).json({ error: err.toString() });
// //   }
// // });

// // app.listen(PORT, () => {
// //   console.log(`ESBMC server listening on http://localhost:${PORT}`);
// // });

// // server-master/index.js

// // 1) Load your API key from .env
// require('dotenv').config();
// console.log('OpenAI key:', process.env.OPENAI_API_KEY ? '✔️ loaded' : '❌ missing');

// const express     = require('express');
// const fs          = require('fs').promises;
// const { execFile } = require('child_process');
// const path        = require('path');
// // 2) Import the OpenAI client class
// const OpenAI      = require('openai');

// const app  = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

// // === ESBMC verification endpoint ===
// app.post('/run-esbmc', async (req, res) => {
//   const { code, unwind = '10' } = req.body;
//   if (typeof code !== 'string') {
//     return res.status(400).json({ error: 'Invalid `code` in request' });
//   }

//   const tmpFile = path.join(__dirname, `input-${Date.now()}.c`);
//   try {
//     await fs.writeFile(tmpFile, code);
//   } catch (e) {
//     return res.status(500).json({ error: `Failed to write temp file: ${e}` });
//   }

//   const args = [
//     tmpFile,
//     '--unwind', unwind,
//     '--no-unwinding-assertions',
//     '--overflow-check',
//     '--unsigned-overflow-check',
//     '--memory-leak-check'
//   ];

//   execFile('esbmc', args, { timeout: 30000 }, (err, stdout, stderr) => {
//     fs.unlink(tmpFile).catch(() => {});
//     const outputText = stderr.trim() ? stderr : stdout;
//     const lines = outputText.split(/\r?\n/);
//     const summaryLines = [];

//     for (let i = 0; i < lines.length; i++) {
//       const l = lines[i].trim();
//       if (/failure:/i.test(l)) {
//         const prev = lines[i - 1]?.trim() || '';
//         if (/^file\s.+function\s.+/i.test(prev)) {
//           summaryLines.push(prev);
//         }
//         summaryLines.push(l);
//       }
//       if (/^VERIFICATION\s+(FAILED|SUCCESSFUL)/.test(l)) {
//         summaryLines.push(l);
//       }
//     }

//     const summary = summaryLines.length ? summaryLines.join('\n') : null;
//     res.json({ exitCode: err?.code ?? 0, summary, stdout, stderr });
//   });
// });

// // === Suggestion endpoint ===
// app.post('/suggest-fix', async (req, res) => {
//   console.log('[/suggest-fix] incoming body:', req.body);
//   const { code, summary } = req.body;
//   if (typeof code !== 'string' || typeof summary !== 'string') {
//     console.error('Invalid payload:', req.body);
//     return res.status(400).json({ error: '`code` and `summary` are required strings' });
//   }

//   const prompt = `
// You are a C expert. Here is some C code that ESBMC reported errors on:

// === Code ===
// ${code}

// === ESBMC Error Summary ===
// ${summary}

// Make the minimal edits needed to fix the code so that ESBMC no longer reports that error.
// Return ONLY the corrected C code.
// `;

//   try {
//     // 3) Instantiate the OpenAI client correctly
//     const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//     const completion = await client.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [
//         { role: 'system', content: 'Suggest minimal C code edits based on ESBMC feedback.' },
//         { role: 'user',   content: prompt }
//       ],
//       temperature: 0.0
//     });

//     const fix = completion.choices?.[0]?.message?.content.trim();
//     console.log('[/suggest-fix] got fix:', fix);
//     return res.json({ fix });
//   } catch (err) {
//     console.error('[/suggest-fix] error:', err);
//     return res.status(500).json({ error: err.toString() });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`ESBMC server listening on http://localhost:${PORT}`);
// });

// //OPENAI_API_KEY=sk-1234uvwxabcd5678uvwxabcd1234uvwxabcd5678


// server-master/index.js

// 1) Load environment variables from .env
require('dotenv').config();
console.log('OpenRouter key:', process.env.OPENROUTER_API_KEY ? '✔️ loaded' : '❌ missing');

const express     = require('express');
const fs          = require('fs').promises;
const { execFile } = require('child_process');
const path        = require('path');
const axios       = require('axios');

const app  = express();
const PORT = process.env.PORT || 3000;

// Allow JSON bodies and CORS
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

/**
 * POST /run-esbmc
 * Takes { code: string, unwind?: string }
 * Writes code to a temp .c file, runs ESBMC with memory-leak + overflow checks,
 * and returns { exitCode, summary, stdout, stderr }
 */
app.post('/run-esbmc', async (req, res) => {
  const { code, unwind = '10' } = req.body;
  if (typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid `code` in request' });
  }

  // 1) write code to a temp file
  const tmpFile = path.join(__dirname, `input-${Date.now()}.c`);
  try {
    await fs.writeFile(tmpFile, code);
  } catch (e) {
    return res.status(500).json({ error: `Failed to write temp file: ${e}` });
  }

  // 2) prepare ESBMC arguments
  const args = [
    tmpFile,
    '--unwind', unwind,
    '--no-unwinding-assertions',
    '--overflow-check',
    '--unsigned-overflow-check',
    '--memory-leak-check'
  ];

  // 3) invoke ESBMC
  execFile('esbmc', args, { timeout: 30000 }, (err, stdout, stderr) => {
    // clean up temp file (best-effort)
    fs.unlink(tmpFile).catch(() => {});

    // pick whichever stream contains text
    const outputText = stderr.trim() ? stderr : stdout;
    const lines = outputText.split(/\r?\n/);
    const summaryLines = [];

    // extract any "failure:" lines + context, and the final VERIFICATION status
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (/failure:/i.test(l)) {
        // include preceding "file ... function ..." context if present
        const prev = lines[i - 1]?.trim() || '';
        if (/^file\s.+function\s.+/i.test(prev)) {
          summaryLines.push(prev);
        }
        summaryLines.push(l);
      }
      if (/^VERIFICATION\s+(FAILED|SUCCESSFUL)/.test(l)) {
        summaryLines.push(l);
      }
    }

    const summary = summaryLines.length ? summaryLines.join('\n') : null;

    // return full output and the extracted summary (if any)
    res.json({
      exitCode: err?.code ?? 0,
      summary, // null if nothing extracted
      stdout,
      stderr
    });
  });
});

/**
 * POST /suggest-fix
 * Takes { code: string, summary: string }
 * Calls OpenRouter's chat/completions endpoint to get a minimal C code fix.
 * Returns { fix: string }
 */
app.post('/suggest-fix', async (req, res) => {
  const { code, summary } = req.body;
  console.log('[/suggest-fix] incoming body:', req.body);

  if (typeof code !== 'string' || typeof summary !== 'string') {
    return res.status(400).json({ error: '`code` and `summary` are required' });
  }

  const textPrompt = `You are a secure code generator that repairs C code. You will be shown a C code, along with the ESBMC output. 
Pay close attention to the ESBMC output, which contains the type of error that occurred and its location. 
Provide the repaired C code as output. Do not output any explanation. Also make bug fixes dont remove anything to somehwo fit in the code. Work on the fix only.

The code is:
${code}

The ESBMC output is:
${summary}
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-maverick:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: textPrompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'ESBMC Web'
        }
      }
    );

    const fix = response.data.choices?.[0]?.message?.content?.trim();
    console.log('[/suggest-fix] got fix:', fix ?? '[none]');
    res.json({ fix: fix || 'No fix was returned.' });

  } catch (err) {
    console.error('[/suggest-fix] OpenRouter error:', err.response?.data || err.message);
    res.status(500).json({ error: err.toString() });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`ESBMC server listening on http://localhost:${PORT}`);
});


//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