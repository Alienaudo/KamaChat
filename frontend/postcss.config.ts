/** @type {import('postcss-load-config').Config} */

import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import postcssNested from 'postcss-nested';
import postcssMqOptimize from 'postcss-mq-optimize';
import postcssCombineDuplicatedSelectors from 'postcss-combine-duplicated-selectors';

const config = {
  plugins: [
    cssnano(),
    autoprefixer(),
    postcssNested(),
    postcssMqOptimize(),
    postcssCombineDuplicatedSelectors(),

  ],
};

export default config;
