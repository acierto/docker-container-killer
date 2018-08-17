import {exec} from 'child_process';

async function sh(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve({stdout, stderr});
            }
        });
    });
}

async function findContainerIdByName(containerName) {
    let {stdout} = await sh('docker container ls');
    const lines = stdout.split('\n');

    for (let lineNumber = 1; lineNumber < lines.length; lineNumber++) {
        const currentLine = lines[lineNumber];
        const firstSpace = currentLine.indexOf(' ');

        if (firstSpace > 0) {
            const containerId = currentLine.substr(0, firstSpace);
            const characters = currentLine.substr(firstSpace).split('');

            let index = 0;
            do {
                index++;
            } while (characters[index] === ' ');

            const containerNameIndex = firstSpace + index;
            const containerNameLength = currentLine.substr(containerNameIndex).indexOf(' ');
            const foundContainerName = currentLine.substr(containerNameIndex, containerNameLength);

            if (foundContainerName === containerName) {
                return containerId;
            }
        }
    }

    return undefined;
}

async function killDockerContainerById(containerName, containerId) {
    console.log(`Stopping docking container "${containerName}"`);
    await sh(`docker stop ${containerId}`);
}

async function main() {
    const containerName = process.argv[2];
    if (!containerName) {
        console.log('Please specify the name of the docker container to kill.');
        return;
    }

    let containerId = await findContainerIdByName(containerName);
    if (!containerId) {
        console.log(`Docker container "${containerName}" is not found.`);
        return;
    }

    await killDockerContainerById(containerName, containerId);

    console.log(`Docker container "${containerName}" was killed`);
}

main();