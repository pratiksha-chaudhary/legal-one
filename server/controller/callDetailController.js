const path = require('path');

const getJsonFileData = require('../utils/jsonFileReader');

exports.getCallDetails = async (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const basePath = path.dirname(require.main.filename);
  try {
    const callLogPromise = getJsonFileData(path.join(basePath, '../json-data/logs.json'));
    const resPromise = getJsonFileData(path.join(basePath, '../json-data/resolution.json'));
    const agentPromise = getJsonFileData(path.join(basePath, '../json-data/agents.json'));
    const [callLogData, agentData, resolutionData] = await Promise.all([
      callLogPromise,
      agentPromise,
      resPromise,
    ]);
    const callLogs = formatData(callLogData, agentData, resolutionData, phoneNumber);
    return res.status(200).json(callLogs);
  } catch (err) {
    return res.status(500).json({
      message: 'Oops!! Something went wrong.',
    });
  }
};

const formatData = (callLogs, agentArr, resolutionsArr, phoneNumber) => {
  const phoneNumberCalls = callLogs.filter((callLog) => callLog.number === phoneNumber);
  return phoneNumberCalls.map((call) => {
    const callResolution = resolutionsArr.find((res) => res.identifier === call.identifier);
    const agent = agentArr.find((agent) => agent.identifier === call.agentIdentifier);

    return {
      phoneNumber: call.number,
      identifier: call.identifier,
      callTime: call.dateTime,
      resolution: callResolution.resolution,
      agentName: `${agent.firstName} ${agent.lastName}`,
    };
  });
};
