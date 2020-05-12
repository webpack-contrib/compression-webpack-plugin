import os from 'os';

import findCacheDir from 'find-cache-dir';

function getCacheDirectory() {
  return findCacheDir({ name: 'compression-webpack-plugin' }) || os.tmpdir();
}

export default getCacheDirectory;
