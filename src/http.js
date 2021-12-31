import $ from 'jquery';
let dummy = {};
try {
    dummy = require('./dummy');
    dummy = dummy.default;
} catch (e) {
    // Ignore
}

// URL helpers
const stgPrefix = window.location.hostname == 'www.codermerlin.com' ? '' : 'stg';
const apiBaseUrl = `https://api-server${stgPrefix ? '-' + stgPrefix : ''}.codermerlin.com`;
const wikiBaseUrl = `https://${stgPrefix ? stgPrefix : 'www'}.codermerlin.com`;

/**
 * Fetch JSON
 * 
 * @param  {string} url The URL to request
 * @param  {object} params Any parameters to pass to AJAX
 * @param  {object} headers Any headers to add
 * @return {Promise<object>}
 */
function getJson(url, params = {}, headers = {})
{
    // If in testing mode, don't actually make an HTTP call
    if (process.env.MIX_ENV == 'testing')
    {
        // Parse the URL
        let parsed = new URL(url);

        for (let key in dummy) {
            // If a dummy match is found, use it
            if (new RegExp(key).test(parsed)) {
                console.log('Would have called', url, 'with params', params, 'and headers', headers);
                return new Promise((resolve, reject) => resolve(dummy[key]));
            }
        }

        console.log('No match found for', url);
        return;
    }

    return $.ajax({
        dataType: 'json',
        url: url,
        data: params,
        headers: headers
    });
}

export default getJson;

export {
    getJson,
    stgPrefix,
    apiBaseUrl,
    wikiBaseUrl
}