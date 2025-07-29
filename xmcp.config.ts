import { type XmcpConfig } from 'xmcp';

const config: XmcpConfig = {
  http: {
    port: 3002,
    trustProxy: true, // Trust proxy headers for rate limiting
  },
};

export default config;
