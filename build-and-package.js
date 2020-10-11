const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const Chalk = require('chalk');

const ROOT = __dirname;
const DIST_PATH = path.join(ROOT, 'dist');
const DIST_ESM_PATH = path.join(DIST_PATH, 'esm');
const PKG_JSON_PATH = path.join(ROOT, 'package.json');
const PKG_JSON_DIST_PATH = path.join(DIST_PATH, 'package.json');
const PKG_JSON_DIST_ESM_PATH = path.join(DIST_ESM_PATH, 'package.json');

const snooze = () => {
    let lastCall = Date.now();
    return {
        sleep: (minTimeout) => {
            const now = Date.now();
            const delta = now - lastCall;
            const timeout = (delta > minTimeout) ? 0 : minTimeout - delta;
            return new Promise(resolve => (
                setTimeout(() => {
                    lastCall = Date.now();
                    resolve();
                }, timeout)
            ));
        }
    };
};


const cleanDist = async () => {
    const o = ora({ text: `cleaning ${Chalk.cyan('./dist')}`, indent: 2 }).start();
    const s = snooze();
    await s.sleep(400);
    o.text = `${Chalk.yellow('rm -fr')} ${Chalk.cyan('./dist')}`;
    await execa('rm', ['-fr', './dist'], { cwd: ROOT });
    await s.sleep(300);
    o.text = `${Chalk.yellow('mkdir')} ${Chalk.cyan('./dist')}`;
    await execa('mkdir', ['./dist'], { cwd: ROOT });
    await s.sleep(300);
    o.text = `${Chalk.yellow('mkdir')} ${Chalk.cyan('./dist/esm')}`;
    await execa('mkdir', ['./dist/esm'], { cwd: ROOT });
    await s.sleep(300);
    o.succeed(Chalk.green(`cleaned ${Chalk.cyan('./dist')}`));
};

const cleanBin = async () => {
    const o = ora({ text: `cleaning ${Chalk.cyan('./bin')}`, indent: 2 }).start();
    const s = snooze();
    await s.sleep(400);
    o.text = `${Chalk.yellow('rm -fr')} ${Chalk.cyan('./bin')}`;
    await execa('rm', ['-fr', './bin'], { cwd: ROOT });
    await s.sleep(200);
    o.text = `${Chalk.yellow('mkdir')} ${Chalk.cyan('./bin')}`;
    await execa('mkdir', ['./bin'], { cwd: ROOT });
    await s.sleep(300);
    o.text = `${Chalk.yellow('mkdir')} ${Chalk.cyan('./bin/types')}`;
    await execa('mkdir', ['./bin/types'], { cwd: ROOT });
    await s.sleep(300);
    o.text = `${Chalk.yellow('mkdir')} ${Chalk.cyan('./bin/cjs')}`;
    await execa('mkdir', ['./bin/cjs'], { cwd: ROOT });
    await s.sleep(300);
    o.text = `${Chalk.yellow('mkdir')} ${Chalk.cyan('./bin/esm')}`;
    await execa('mkdir', ['./bin/esm'], { cwd: ROOT });
    await s.sleep(300);
    o.succeed(Chalk.green(`cleaned ${Chalk.cyan('./bin')}`));
};

const buildTypes = async () => {
    const o = ora({ text: `writing generated type definitions into ${Chalk.cyan('./bin/types')}`, indent: 2 }).start();
    const s = snooze();
    await execa('node', ['./node_modules/.bin/tsc', '-p', './tsconfig.dist.json', '--emitDeclarationOnly'], { cwd: ROOT });
    await s.sleep(300);
    o.succeed(Chalk.green(`wrote generated type definitions into ${Chalk.cyan('./bin/types')}`));
};

const buildCJS = async () => {
    const o = ora({ text: `compiling as ES5 with CommonJS modules into ${Chalk.cyan('./bin/cjs')}`, indent: 2 }).start();
    const s = snooze();
    await execa('node', ['./node_modules/.bin/babel', 'src', '--out-dir', 'bin/cjs', '--extensions', '.ts,.tsx'], { cwd: ROOT, env: { TARGET: 'cjs' } });
    await s.sleep(300);
    o.succeed(Chalk.green(`compiled as ES5 with CommonJS modules into ${Chalk.cyan('./bin/cjs')}`));
};

const buildESM = async () => {
    const o = ora({ text: `compiling as ES2020 with native ES modules into ${Chalk.cyan('./bin/esm')}`, indent: 2 }).start();
    const s = snooze();
    await execa('node', ['./node_modules/.bin/babel', 'src', '--out-dir', 'bin/esm', '--extensions', '.ts,.tsx'], { cwd: ROOT, env: { TARGET: 'esm' } });
    await s.sleep(300);
    o.succeed(Chalk.green(`compiled as ES2020 with native ES modules into ${Chalk.cyan('./bin/esm')}`));
};

const copyTypes = async () => {
    const o = ora({ text: `copying generated type definitions from ${Chalk.cyan('./bin/types')} into ${Chalk.cyan('./dist')}`, indent: 2 }).start();
    const s = snooze();
    await s.sleep(400);
    o.text = `${Chalk.yellow('cp -r')} ${Chalk.cyan('./bin/types/.')} ${Chalk.cyan('./dist')}`;
    await execa('cp', ['-r', './bin/types/.', './dist'], { cwd: ROOT });
    await s.sleep(300);
    o.succeed(Chalk.green(`copied generated type definitions from ${Chalk.cyan('./bin/types')} into ${Chalk.cyan('./dist')}`));
};

const copyCJS = async () => {
    const o = ora({ text: `copying ES5 with CommonJS modules from ${Chalk.cyan('./bin/cjs')} into ${Chalk.cyan('./dist')}`, indent: 2 }).start();
    const s = snooze();
    await s.sleep(400);
    o.text = `${Chalk.yellow('cp -r')} ${Chalk.cyan('./bin/cjs/.')} ${Chalk.cyan('./dist')}`;
    await execa('cp', ['-r', './bin/cjs/.', './dist'], { cwd: ROOT });
    await s.sleep(300);
    o.succeed(Chalk.green(`copied ES5 with CommonJS modules from ${Chalk.cyan('./bin/cjs')} into ${Chalk.cyan('./dist')}`));
};

const copyESM = async () => {
    const o = ora({ text: `copying ES2020 with native ES modules from ${Chalk.cyan('./bin/esm')} into ${Chalk.cyan('./dist/esm')}`, indent: 2 }).start();
    const s = snooze();
    await s.sleep(400);
    o.text = `${Chalk.yellow('cp -r')} ${Chalk.cyan('./bin/esm/.')} ${Chalk.cyan('./dist/esm')}`;
    await execa('cp', ['-r', './bin/esm/.', './dist/esm'], { cwd: ROOT });
    await s.sleep(300);
    o.succeed(Chalk.green(`copied ES2020 with native ES modules from ${Chalk.cyan('./bin/esm')} into ${Chalk.cyan('./dist/esm')}`));
};


const walkDir = async (dir, depth = 0) => {
    const contents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(contents.map(item => {
        const res = path.resolve(dir, item.name);
        return item.isDirectory() ? walkDir(res, depth + 1) : path.relative(DIST_ESM_PATH, res);
    }));
    files.unshift(path.relative(DIST_ESM_PATH, dir) + path.sep);
    let flat = files.flat();
    if (depth === 0) {
        // when in the root dir (ie: ./dist) prepend the `./` prefix
        flat = flat.map(item => (
            `${(item === path.sep ? '.' : `.${path.sep}`)}${item}`
        ));
    }
    return flat;
};

const patchPkgJSON = async () => {
    const o = ora({ text: `reading package manifest from ${Chalk.cyan('./package.json')}`, indent: 2 }).start();
    const s = snooze();
    const pkg = await fs.readJSON(PKG_JSON_PATH);
    await s.sleep(300);
    o.text = `scanning ${Chalk.cyan('./dist')}`;
    const files = await walkDir(path.join(DIST_ESM_PATH));
    await s.sleep(400);
    o.text = `building export map`;
    const exportsMap = {};
    for (let file of files) {
        if (file.endsWith(path.sep)) { // it's a directory
            if (file === `.${path.sep}`) {
                // bare import (ie: `import foo from 'bar';`) uses the "main" entrypoint from package.json
                exportsMap['.'] = {
                    require: pkg.main,
                    default: `.${path.sep}${path.join('./esm', pkg.main)}`
                };
            } else if (files.includes(`.${path.sep}${path.join(file, 'index.js')}`)) {
                // only create an import alias for subpath import (eg: import foo from 'bar/biz';`)
                // when there is a ./index
                exportsMap[file.slice(0, -1)] = { // use of `.slice (0, -1)` chops off the trailing / (or \ on windows)
                    require: `.${path.sep}${path.join(file, 'index.js')}`,
                    default: `.${path.sep}${path.join('./esm', file, 'index.js')}`
                };
            } // otherwise there's no index so no subpath alias is created
        } else { // it's a file
            exportsMap[file] = {
                require: file,
                default: `.${path.sep}${path.join('./esm', file)}`
            };
            if (file.endsWith('.js')) {
                // if it ends in `.js`, create an alias (eg: `import foo from 'foo/bar.js';`  ==>  `import foo from 'foo/bar';`)
                // this is how imports normally work, but with "exports" in package.json, it has to be explicit
                exportsMap[file.slice(0, -3)] = { // use of `.slice (0, -3)` chops off the `.js`
                    require: file,
                    default: `.${path.sep}${path.join('./esm', file)}`
                };
            }
        }

    }
    await s.sleep(400);
    o.text = `patching ${Chalk.cyan('package.json')}`;
    pkg.type = 'commonjs';
    pkg.exports = exportsMap;
    await s.sleep(300);
    o.text = `writing patched ${Chalk.cyan('package.json')} to ${Chalk.cyan('./dist/package.json')}`;
    await fs.writeJSON(PKG_JSON_DIST_PATH, pkg, { spaces: 4 });
    await s.sleep(300);
    o.text = `writing stub ${Chalk.cyan('package.json')} to ${Chalk.cyan('./dist/esm/package.json')}`;
    await fs.writeJSON(PKG_JSON_DIST_ESM_PATH, { type: 'module' }, { spaces: 4 });
    await s.sleep(300);
    o.succeed(Chalk.green(`wrote patched ${Chalk.cyan('package.json')} to ${Chalk.cyan('./dist/package.json')}`));
};

process.on('unhandledRejection', (...args) => {
    console.error('uncaught rejection!', ...args);
    process.exit(-1);
});

process.on('uncaughtException', (...args) => {
    console.error('uncaught exception!', ...args);
    process.exit(-1);
});

(async () => {
    console.log(Chalk.blueBright('building and packaging...'));
    console.log('[1/3] Cleaning');
    await cleanDist();
    await cleanBin();
    console.log('[2/3] Building');
    await buildTypes();
    await buildCJS();
    await buildESM();
    console.log('[3/3] Patching');
    await copyTypes();
    await copyCJS();
    await copyESM();
    await patchPkgJSON();
})();
