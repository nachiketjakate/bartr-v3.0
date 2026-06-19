import FtpDeploy from "ftp-deploy";
import * as dotenv from 'dotenv';

dotenv.config();

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT || 22,
  localRoot: "./dist",
  remoteRoot: "/public_html/",
  include: ["*", "**/*"],
  deleteRemote: false,
  forcePasv: true,
  sftp: true
};

console.log("🚀 Starting automatic deployment to cPanel...");

ftpDeploy
  .deploy(config)
  .then((res) => console.log("🎉 DEPLOYMENT COMPLETE! Your site is live!"))
  .catch((err) => console.log("❌ Deployment error:", err));
