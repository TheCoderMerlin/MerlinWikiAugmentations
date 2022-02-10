import $ from 'jquery';

let dummy = {};

// URL helpers
const stgPrefix = window.location.hostname == 'www.codermerlin.com' ? '' : 'stg';
const apiBaseUrl = window.apiBaseUrl || `https://api-server${stgPrefix ? '-' + stgPrefix : ''}.codermerlin.com`;
const wikiBaseUrl = `https://${stgPrefix ? stgPrefix : 'www'}.codermerlin.com`;

class Http {
    /**
     * "AJAX"
     *
     * @param  {string} method
     * @param  {string} url
     * @param  {object} data
     * @param  {object} headers
     * @return {$.ajax}
     */
    static _ajax(method, url, data = {}, headers = {}) {
        return $.ajax({
            method: method,
            dataType: "json",
            url: url,
            data: data,
            headers: headers
        });
    }

    /**
     * Fetch JSON
     *
     * @param  {string} url The URL to request
     * @param  {object} params Any parameters to pass to AJAX
     * @param  {object} headers Any headers to add
     * @return {Promise<object>}
     */
    static get(url, params, headers) {
        return Http._ajax('GET', url, params, headers);
    }
}

const getJson = Http.get;

export default getJson;

export {
    Http,
    getJson,
    stgPrefix,
    apiBaseUrl,
    wikiBaseUrl
}