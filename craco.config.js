const CracoAlias = require("craco-alias");
const sassResourcesLoader = require('craco-sass-resources-loader');

module.exports = {
    plugins: [{
            plugin: require('craco-plugin-scoped-css')
        }, {
            plugin: CracoAlias,
            options: {
                source: 'jsconfig'
            }
        }, {
            plugin: sassResourcesLoader,
            options: {
                resources: './src/styles/_variables.scss',
            },
        },
    ],
};
