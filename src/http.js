import $ from 'jquery';
import dummy from './dummy';

/**
 * Fetch JSON
 * 
 * @param  {string} url The URL to request
 * @param  {Object} params Any parameters to pass to AJAX
 * @param  {Object} headers Any headers to add
 * @return {Promise<Object>}
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
    getJson
}