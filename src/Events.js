export const API = {

  // client-server events

  ALIVE:      `alv`,
  QUERY:      `que`,
  SUCCESS:    `sus`,
  FAILURE:    `fai`,
  TRIGGER:    `trg`,

  // only client events

  READY:      `ready`,
  UNREADY:    `unready`,
  ERROR:      `error`,
  DISCONNECT: `disconnect`

};


export const RESOURCE = {

  // client-server events

  SYNC:       `snc`,
  DESTROY:    `dst`,

  // only client events

  CHANGE:     `change`,
  ERROR:      `error`

};
