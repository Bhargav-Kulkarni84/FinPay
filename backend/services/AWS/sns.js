// services/AWS/sns.js
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

function formatTransactionMessage(data, receiptUrl) {
  return `Transaction Alert

Transaction ID: ${data.txnID}
From: ${data.from}
To: ${data.to}
Amount: Rs.${data.amount.toFixed(2)}
Date: ${new Date(data.date).toLocaleString()}

You can download your receipt here: ${receiptUrl}

Thank you for using our service.`;
}

async function publishMessage(topicArn, data, receiptUrl) {
  const message = formatTransactionMessage(data, receiptUrl);

  try {
    await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: message,
        Subject: "Transaction Notification",
      })
    );
    console.log("Email notification sent via SNS!");
  } catch (err) {
    console.error("Error sending SNS email:", err);
  }
}

module.exports = { publishMessage };
