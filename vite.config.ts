import { copyFileSync } from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

/**
 * pdfjs-dist ships the worker as .mjs; many hosts (ex.: IIS) serve .mjs as
 * application/octet-stream, which breaks ES module workers. We copy the same
 * bytes to public/pdf.worker.js so dev + build serve it with a .js MIME type.
 */
function pdfWorkerPublicJs(): Plugin {
	const workerSource = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.mjs');
	const workerDest = path.resolve(__dirname, 'public/pdf.worker.js');

	return {
		name: 'pdf-worker-public-js',
		buildStart() {
			copyFileSync(workerSource, workerDest);
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), pdfWorkerPublicJs()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@/features': path.resolve(__dirname, './src/features'),
			'@/lib': path.resolve(__dirname, './src/lib'),
		},
	},
});
