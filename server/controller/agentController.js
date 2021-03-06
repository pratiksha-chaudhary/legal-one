const path = require('path');

const getJsonFileData = require('../utils/jsonFileReader');

exports.getAgentData = async (req, res) => {
  const agentId = req.params.agentId;
  const basePath = path.dirname(require.main.filename);
  try {
    const callLogPromise = getJsonFileData(path.join(basePath, '../json-data/logs.json'));
    const resPromise = getJsonFileData(path.join(basePath, '../json-data/resolution.json'));
    const [callLogData, resolutionData] = await Promise.all([callLogPromise, resPromise]);
    const callLogs = formatData(callLogData, resolutionData, agentId);
    return res.status(200).json(callLogs);
  } catch (err) {
    return res.status(500).json({
      message: 'Oops!! Something went wrong.',
    });
  }
};

const formatData = (callLogs, resolutionsArr, agentId) => {
  const agentCalls = callLogs.filter((callLog) => callLog.agentIdentifier === agentId);
  return agentCalls.map((call) => {
    const callResolution = resolutionsArr.find((res) => res.identifier === call.identifier);

    return {
      phoneNumber: call.number,
      identifier: call.identifier,
      callTime: call.dateTime,
      resolution: callResolution.resolution,
    };
  });
};
