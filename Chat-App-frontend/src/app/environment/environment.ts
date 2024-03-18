const environments = {
  work: {
    ui: {
      hostname: 'http://192.1.150.239',
      port: 4200,
    },
    socket_backend: {
      hostname: 'http://192.1.150.239',
      port: 3001,
    },
  },
  sc_home: {
    ui: {
      hostname: 'http://192.168.251.84',
      port: 4200,
    },
    socket_backend: {
      hostname: 'http://192.168.251.84',
      port: 3001,
    },
  },
  localhost: {
    ui: {
      hostname: 'http://localhost',
      port: 4200,
    },
    socket_backend: {
      hostname: 'http://localhost',
      port: 3001,
    },
  },
};

const profile = 'sc_home';

const UIEnv = environments[profile].ui;
const socketBackendEnv = environments[profile].socket_backend;

export { UIEnv, socketBackendEnv };
