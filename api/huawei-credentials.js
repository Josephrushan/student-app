// API route to provide Huawei credentials
export default function handler(req, res) {
  res.status(200).json({
    appId: "YOUR_HUAWEI_APP_ID", // Replace with your actual Huawei App ID
    appSecret: "YOUR_HUAWEI_APP_SECRET" // Replace with your actual Huawei App Secret
  });
}