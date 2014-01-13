(function($){

$.jqzabbix = function(options) {

// initialize options
options = $.extend({
    // default settings
    url: 'http://localhost/zabbix/api_jsonrpc_jsonp.php',
    username: 'Admin',
    password: 'zabbix',
    basicauth: false,
    busername: '',
    bpassword: '',
    timeout: 5000,
    limit: 1000,
}, options);

// initialize variables
var rpcid = 0;
var authid = null;
var apiversion = null;
var errormsg = null;


function createAjaxOption(method, params, success, error, complete) {

    // check method option
    if (method === null || typeof method === 'undefined') {
        return false;
    }

    // check params option
    if (params === null || typeof params === 'undefined') {
        params = {};
    }

    // default params
    params = $.extend({
        extendoutput: true,
        limit: options.limit
    }, params);

    // merge params with username and password
    $.extend(params, {
        user: options.username,
        password: options.password
    });

    // create sending data
    var data = {
        jsonrpc: '2.0',
        id: ++rpcid,
        auth: authid,
        method: method,
        params: params
    };

    // create AJAX option
    var ajaxOption = {
        contentType: 'application/json-rpc',
        dataType: 'jsonp',
        type: 'GET',
        //timeout: options.timeout,
        url: options.url,
        data: "data=" + JSON.stringify(data),
        success: function(response, status) {

            // resuest error
            if (response === null) {
                errormsg = {
                    data: 'Network error'
                };
            }
            else if ('error' in response) {
                errormsg = response.error;
            }
            
            // resuest success
            else {

                // clear error message
                errormsg = null;

                // do success function
                if (typeof success === 'function') {
                    success(response, status);
                }
            }
        },
        error: function(response, status) {

            if (status === 'timeout') {
                errormsg = 'Network timeout';
            }
            else if (response.status && response.statusText) {
                errormsg = status + ' : ' + response.status + ' ' + response.statusText;
            }
            else {
                errormsg = 'Unknown error';
            }

            if (errormsg && typeof error === 'function') {
                error();
            }
        },
        complete: function() {

            if (typeof complete === 'function') {
                complete();
            }
        }
    };

    // if use http basic authentication
    if (options.basicauth === true) {
        var base64 = base64encode(options.busername + ':' + options.bpassword);
        ajaxOption.beforeSend = function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64);
        }
    }

    return ajaxOption;
}

function base64encode(string) {

    var base64list = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var t = '', p = -6, a = 0, i = 0, v = 0, c;

    while ( (i < string.length) || (p > -6) ) {
        if ( p < 0 ) {
            if ( i < string.length ) {
            c = string.charCodeAt(i++);
            v += 8;
            } else {
                c = 0;
            }
            a = ((a&255)<<8)|(c&255);
            p += 8;
        }
        t += base64list.charAt( ( v > 0 )? (a>>p)&63 : 64 )
        p -= 6;
        v -= 6;
    }
    return t;
}

this.init = function() {
    rpcid = 0;
    authid = null;
    apiversion = null;
    errormsg = null;

    return true;
}

this.setOptions = function(addoptions) {

    options = $.extend(options, addoptions);
}

this.isError = function() {

    if (errormsg) {
        return errormsg;
    }
    else {
        return false;
    }
}

this.sendAjaxRequest = function(method, params, success, error, complete) {

    return $.ajax(createAjaxOption(method, params, success, error, complete));
}

this.getApiVersion = function(params, success, error, complete) {

    var method = 'apiinfo.version';
    var successMethod = function(response, status) {
        apiversion = response.result;

        if (success) {
            success(response, status);
        }
    }

    return this.sendAjaxRequest(method, params, successMethod, error, complete);
}

this.userLogin = function(params, success, error, complete) {

    // reset rpcid
    rpcid = 0;

    // method
    var method = 'user.login';

    var successMethod = function(response, status) {
        authid = response.result;

        if (success) {
            success(response, status);
        }
    }

    return this.sendAjaxRequest(method, params, successMethod, error, complete);
}

this.getAuthId = function() {
    return authid;
}

} // end plugin
})(window.jQuery || window.Zepto); // function($)
