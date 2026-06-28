module.exports = {
  apps: [
    {
      name: "chuyenphat24h",
      script: "dist/server.cjs",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3010,
      },
      max_memory_restart: "512M",
      time: true,
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
    },
  ],
};
