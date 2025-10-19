const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');

// 讀取原始文件
const sourceCode = fs.readFileSync('script.original.js', 'utf8');

// 混淆配置
const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
});

// 寫入混淆後的代碼
fs.writeFileSync('script.js', obfuscationResult.getObfuscatedCode(), 'utf8');

console.log('✓ JavaScript 混淆完成!');
console.log('✓ 原始文件已備份至: script.original.js');
console.log('✓ 混淆後的文件: script.js');
console.log('\n請在瀏覽器中測試網站功能是否正常。');
