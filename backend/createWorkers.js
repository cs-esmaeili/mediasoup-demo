const os = require('os');
const mediasoup = require("mediasoup");
const { workerSettings } = require("./config/config");
const totalThreads = os.cpus().length; // max number allowed workers


const createWorkers = () => new Promise(async (resolve, reject) => {
    let workers = [];

    for (let i = 0; i < totalThreads; i++) {
        const worker = await mediasoup.createWorker({
            rtcMinPort: workerSettings.rtcMinPort,
            rtcMaxPort: workerSettings.rtcMaxPort,
            logLevel: workerSettings.logLevel,
            logTags: workerSettings.logTags
        })
        worker.on("died", () => {
            //this should never happen
            process.exit(1);
        });

        workers.push(worker);
    }
    resolve(workers);
})

module.exports = createWorkers;
