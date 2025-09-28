import AWS from 'aws-sdk';

const lambda = new AWS.Lambda({ region: process.env.AWS_REGION });

export const invokeLambda = async (functionName, payload) => {
  const params = {
    FunctionName: functionName,
    Payload: JSON.stringify(payload),
  };

  try {
    const result = await lambda.invoke(params).promise();
    console.log('Lambda invoked:', result);
    return result;
  } catch (err) {
    console.error('Lambda Error:', err);
    throw err;
  }
};
