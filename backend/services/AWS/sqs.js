import AWS from 'aws-sdk';

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });

export const sendMessageToSQS = async (queueUrl, message) => {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  };

  try {
    const result = await sqs.sendMessage(params).promise();
    console.log('SQS message sent:', result.MessageId);
    return result;
  } catch (err) {
    console.error('SQS Error:', err);
    throw err;
  }
};
