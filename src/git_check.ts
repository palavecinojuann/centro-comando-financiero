import { execSync } from 'child_process';
console.log("App.tsx history:");
console.log(execSync('git log -p -n 3 src/App.tsx').toString());
console.log("ControlCentral history:");
console.log(execSync('git log -p -n 3 src/components/ControlCentral.tsx').toString());
