module.exports = {
  apps: [
    {
      name: 'besugen-server',
      script: './dist/index.js',
      cwd: '/root/besugen-c/apps/server',
      env: {
        NODE_ENV: 'production',
        PORT: 2567,
      },
      node_args: '--experimental-specifier-resolution=node',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/root/.pm2/logs/besugen-error.log',
      out_file: '/root/.pm2/logs/besugen-out.log',
      merge_logs: true,
    },
  ],
};
