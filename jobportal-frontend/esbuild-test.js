import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['index.js'],
  bundle: true,
  outfile: 'out.js',
}).catch(() => process.exit(1));
