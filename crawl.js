var crawler = require('crawler');
var url = require('url');
var async = require('async');
var prompt = require('prompt');

var c = new crawler();

var schema = {
    properties: {
        keyword: {
            pattern: '^[a-zA-Z0-9\W]+$',
            message: 'Please provide a valid keyword',
            required: true
        },
        page: {
            pattern: '^[1-9][0-9]*$',
            message: 'Please provide a valid page number',
            required: true
        }
    }
};

prompt.start();
console.log('Please enter the keyword and page number for which search to be done.');
prompt.get(schema, function (err, result) {
    if (err) {} else {
        async.series([function (cb) {
                c.queue([{
                    uri: 'http://www.shopping.com/products?KW=' + result.keyword,
                    callback: function (error, res, done) {
                        if (error) {
                            cb(error, null);
                        } else {
                            if (res.statusCode == 200) {
                                var $ = res.$;
                                var totalCount = $('.numTotalResults').text();
                                if (totalCount != '') {
                                    totalCount = totalCount.split('of')[1];
                                    cb(null, totalCount);
                                } else {
                                    cb('no result found', null);
                                }
                            } else {
                                cb('something wrong', null);
                            }
                        }
                        done();
                    }
}]);
        }, function (cb) {
                c.queue([{
                    uri: 'http://www.shopping.com/products~PG-' + result.page + '?KW=' + result.keyword,
                    callback: function (error, res, done) {
                        if (error) {
                            cb(error, null);
                        } else {
                            if (res.statusCode == 200) {
                                var $ = res.$;
                                var totalCount = $('.numTotalResults').text();
                                if (totalCount != '') {
                                    var productBox = {};
                                    var checkLength = ($('.gridBox').length);
                                    if (Math.ceil(parseInt(totalCount.split('of')[1]) / checkLength) >= result.page) {
                                        $('.gridBox').each(function (k, v) {
                                            var tmp = Object.keys(productBox).length + 1;
                                            tmp = 'item' + tmp;
                                            productBox[tmp] = new Object();
                                            productBox[tmp]['title'] = $(this).find('.productName').find('span').attr('title');
                                            productBox[tmp]['price'] = $(this).find('.productPrice').text().trim();
                                            if (Object.keys(productBox).length == checkLength) {
                                                cb(null, productBox);
                                            }
                                        });
                                    } else {
                                        cb(null, 'no result found');
                                    }
                                } else {
                                    cb(null, 'no result found');
                                }
                            } else {
                                cb('something wrong', null);
                            }
                        }
                        done();
                    }
}]);
            }],
            function (crawl_err, response) {
                if (crawl_err) {
                    if (crawl_err == 'no result found') {
                        console.log('No result found for ' + '"' + result.keyword + '"');
                    } else {
                        console.log('There seeme some proble, please try again');
                    }
                } else {
                    console.log('total number of results for ' + '"' + result.keyword + '"' + ' is: ' + response[0]);
                    if (response[1] == 'no result found') {
                        console.log('total number of results for ' + '"' + result.keyword + '"' + ' on Page: ' + result.page + ' is: 0');
                    } else {
                        console.log('total number of results for ' + '"' + result.keyword + '"' + ' on Page: ' + result.page + ' is: ' + JSON.stringify(response[1]));
                    }
                }
            });
    }
});