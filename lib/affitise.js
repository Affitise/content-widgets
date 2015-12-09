/**
 * Affitise Javascript Client
 * @author Affitise Ltd [tech@affitse.com]
 * @license {@link http://www.apache.org/licenses/LICENSE-2.0.html|Apache 2.0}
 */
var Affitise = Affitise || {};
Affitise.feed = Affitise.feed || {};
Affitise.feeds = Affitise.feeds || [];

/**
 * Initialize Affitise with your api key and options
 * @public
 * @constructor
 * @param {string} apiKey - Your {@link https://affitise.com/user/api|api key}
 * @param {string} feedId - The {@link https://affitise.com/user/feed|feed id} to display
 * 
 */
Affitise.feed = function(apiKey, feedId) {
    Affitise.feeds.push(this);
    this.apiKey = apiKey;
    this.feedId = feedId;
    this.rotation = null;
    this.merchantWindow = null;
    this.data = null;
    this.currentPosition = 0;
    this.size = 'MediumRectangle';
    //this.cdnBaseUrl = 'https://s3-eu-west-1.amazonaws.com/static.affitise.com/client/v1';
    this.cdnBaseUrl = 'https://d3t7o5057mxckn.cloudfront.net/client/v1';
    this.cssUrl = 'https://affitise.com/client/v1/affitise.min.css';
    this.id = Math.floor((Math.random() * 1000000) + 1);
    this.callback = 'affitise_cb_' + this.id;
    this.allowRotation = true;
    
    this.debugCss = false;
    this.debugJs = true;
    this.debugLoading = false;
    this.debug = false; /* rotation */
    
    if (this.debugCss) {
        this.cssBaseUrl = '';
    }

    // TODO: add setters
    this.rotationSpeed = 5000;
    this.order = 'feed';
    this.future = false;
    this.displayElement = 'affitise-display';

    this.getPrevPosition = function() {
        return this.currentPosition - 1 >= 0 ? this.currentPosition - 1 : this.data.length - 1;
    };

    this.getNextPosition = function() {
        return this.currentPosition + 1 >= this.data.length ? 0 : this.currentPosition + 1;
    };

    this.getMainDiv = function() {
        if (this.size === 'MediumRectangle') {
            return 'affitise-css-medium-rectangle';
        } else if (this.size === 'Leaderboard') {
            return 'affitise-css-leaderboard';
        } else if (this.size === 'WideSkyscraper') {
            return 'affitise-css-wide-skyscrapper';
        }
        
        return null;
    };

    this.getBgDiv = function() {
        if (this.size === 'MediumRectangle') {
            return 'affitise-css-bg-medium-rectangle';
        } else if (this.size === 'Leaderboard') {
            return 'affitise-css-bg-leaderboard';
        } else if (this.size === 'WideSkyscraper') {
            return 'affitise-css-bg-wide-skyscrapper';
        }
        
        return null;
    };

    this.getLoadingDiv = function() {
        if (this.size === 'MediumRectangle') {
            return 'affitise-css-loading-medium-rectangle';
        } else if (this.size === 'Leaderboard') {
            return 'affitise-css-loading-leaderboard';
        } else if (this.size === 'WideSkyscraper') {
            return 'affitise-css-loading-wide-skyscrapper';
        }
        
        return null;
    };

    this.getMaxNameSize = function() {
        if (this.size === 'MediumRectangle') {
            return 35;
        } else if (this.size === 'Leaderboard') {
            return 45;
        } else if (this.size === 'WideSkyscraper') {
            return 20;
        }

        return 0;
    };
    
    this.getMaxDescSize = function() {
        if (this.size === 'MediumRectangle') {
            return 90;
        } else if (this.size === 'Leaderboard') {
            return 90;
        } else if (this.size === 'WideSkyscraper') {
            return 150;
        }

        return 0;
    };

    this.areTermsSameLine = function() {
        if (this.size === 'WideSkyscraper') {
            return false;
        }

        return true;
    };

    this.getLogoDiv = function() {
        var logo = '<a href="https://affitise.com" target="_blank"><img src="' + this.cdnBaseUrl + '/affilogo.png" /> Affitise</a>';
        return '<div class="affitise-css-logo">' + logo + '</div>';
    };

    this.displayItem = function() {
        var item = this.data[this.currentPosition];
        var url = item.discount_url;
        var linkButtonImage = '/GetTheDeal.png';
        if (item.discount_code) {
            url = item.discount_url + '&code=' + item.discount_code;
            linkButtonImage = '/GetTheVoucher.png';
        }
        var linkButton = '<a target="_blank" href="' + url + '"><img src="' + this.cdnBaseUrl + linkButtonImage + '" /></a>';
        var image = '<img src="' + item.merchant_image + '" title="' + item.merchant_name + '" />';
        var termsLink = '';
        if (typeof item.discount_restrictions !== 'undefined') {
            if (this.areTermsSameLine()) {
                termsLink = '<a id="affitise-terms-button-' + this.id + '">T&C</a>';
            } else {
                termsLink = '<a id="affitise-terms-button-' + this.id + '">Terms & Conditions</a>';
            }
        }
        var endsDate = new Date(item.discount_expiry);
        var shortEndsDate = endsDate.getDate() + '/' + (endsDate.getMonth() + 1) + '/' + endsDate.getFullYear().toString().substring(2,4);
        var ends = 'Ends ' + '<span title="' + endsDate.toLocaleDateString() + '">' +  shortEndsDate + '</span>';
        var termsLine = '<div class="affitise-css-ends-terms">' + ends + ' - ' + termsLink + '</div>';
        if (termsLink === '') {
            termsLine = '<div class="affitise-css-ends-terms">' + ends + '</div>';
        }

        if (!this.areTermsSameLine()) {
            termsLine = '<div class="affitise-css-ends">' + ends + '</div>' +
                     '<div class="affitise-css-terms">' + termsLink + '</div>';
        }
        var descr = '<div class="affitise-css-descr-wrap" title="' + item.discount_title + '">' + this.ellipsize(item.discount_title, this.getMaxDescSize()) + '</div>';
        return '<div class="affitise-css"><div class="' + this.getMainDiv() + ' cleanslate">' +
               '<div class="' + this.getBgDiv() + '"></div>' + 
               '<div class="affitise-css-image-wrapper"><div class="affitise-css-image">' + image + '</div></div>' +
               '<div class="affitise-css-name" title="' + item.merchant_name + '">' + this.ellipsize(item.merchant_name, this.getMaxNameSize()) + '</div>' +
               '<div class="affitise-css-descr">' + descr + '</div>' +
               '<div class="affitise-css-deal-button">' + linkButton + '</div>' +
               termsLine +
               this.getLogoDiv() +
               '<div id="affitise-prev-button-' + this.id + '" class="affitise-css-left-button">&nbsp;</div>' +
               '<div id="affitise-next-button-' + this.id + '" class="affitise-css-right-button">&nbsp;</div>' +
               '</div></div>';
    };

    this.importScript = function(url) {
        window[this.callback] = function(data) {
            this.data = data;
            this.displayCurrent();
        }.bind(this);
        var scriptId = 'affitise-import-script-' + this.id;
        if (!document.getElementById(scriptId))
        {
            var head  = document.getElementsByTagName('head')[0];
            var script  = document.createElement('script');
            script.id   = scriptId;
            script.type = 'text/javascript';
            script.src = url;
            head.appendChild(script);
        }
    };

    this.importCss = function() {
        var head  = document.getElementsByTagName('head')[0];
        var cssId = 'affitise-css-link';
        if (!document.getElementById(cssId))
        {
            var link  = document.createElement('link');
            link.id   = cssId;
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = this.cssUrl;
            link.media = 'all';
            head.appendChild(link);
        }        
    };

    this.ellipsize = function(name, maxLength) {
        if (name.length > maxLength) {
            return name.substring(0, maxLength - 3) + '...';
        }

        return name;
    };

    this.displayTerms = function(id) {
        if (!document.getElementById(id)) {
            return;
        }
        
        this.stop();
        var item = this.data[this.currentPosition];
        var image = '<img src="' + item.merchant_image + '" title="' + item.merchant_name + '" />';
        var termsHtml = '<div class="affitise-css"><div class="' + this.getMainDiv() + ' cleanslate">' +
                '<div class="affitise-css-full-terms-close" id="affitise-close-button-' + this.id + '">X</div>' +
               '<div class="' + this.getBgDiv() + '"></div>' + 
               '<div class="affitise-css-image-wrapper"><div class="affitise-css-image">' + image + '</div></div>' +
               '<div class="affitise-css-name">Terms</div>' +
               '<div class="affitise-css-descr" title="' + item.discount_restrictions + '">' + this.ellipsize(item.discount_restrictions, this.getMaxDescSize()) + '</div>' +
               '<div class="affitise-css-deal-button affitise-css-terms-close-button" id="affitise-terms-close-button-' + this.id + '"><img src="' + this.cdnBaseUrl + '/goback.png" /></div>' +
               this.getLogoDiv() +
               '</div></div>';
        this.displayHtml(termsHtml);
    };

    this.displayHtml = function(value) {
        if (document.getElementById(this.displayElement)) {
            document.getElementById(this.displayElement).innerHTML = value;
        }

        if (document.getElementById('affitise-terms-button-' + this.id)) {
            document.getElementById('affitise-terms-button-' + this.id).onclick = function() {
                this.displayTerms('affitise-terms-button-' + this.id);
            }.bind(this);
        }
        
        if (document.getElementById('affitise-prev-button-' + this.id)) {
            document.getElementById('affitise-prev-button-' + this.id).onclick = function() {
                this.displayPrev(true);
            }.bind(this);
        }
        if (document.getElementById('affitise-next-button-' + this.id)) {
            document.getElementById('affitise-next-button-' + this.id).onclick = function() {
                this.displayNext(true);
            }.bind(this);
        }
        
        if (document.getElementById('affitise-close-button-' + this.id)) {
            document.getElementById('affitise-close-button-' + this.id).onclick = function() {
                this.displayCurrent();
            }.bind(this);
        }        

        if (document.getElementById('affitise-terms-close-button-' + this.id)) {
            document.getElementById('affitise-terms-close-button-' + this.id).onclick = function() {
                this.displayCurrent();
            }.bind(this);
        }
    };
    
    this.displayLoading = function() {
        var html = '<div class="affitise-css"><div class="' + this.getLoadingDiv() + ' cleanslate">' +
                   this.getLogoDiv() +                
                   '</div></div>';
        this.displayHtml(html);
    };
    
    this.displayCurrent = function() {
        if (this.data.length >= 1 && typeof this.data[0].merchant_name !== 'undefined') {
            this.displayHtml(this.displayItem());
            if (this.allowRotation) {
                this.rotation = setTimeout(function() {
                    if (!this.debug) {
                        this.displayNext(false);
                    }
                }.bind(this), this.rotationSpeed);
            }
        } else {
            this.displayLoading();
        }
    };

    this.stopRotation = function() {
        clearTimeout(this.rotation);
        this.allowRotation = false;
    };

    this.displayPrev = function(stop) {
        if (stop) {
            this.stop();
        }
        this.currentPosition = this.getPrevPosition();
        this.displayCurrent();
    };

    this.displayNext = function(stop) {
        if (stop) {
            this.stop();
        }
        this.currentPosition = this.getNextPosition();
        this.displayCurrent();
    };
    
    this.load = function() {
        var self = this;
        this.data = null;
        this.importCss();
        this.displayLoading();
        if (window.XMLHttpRequest) {
            var url = "https://api.affitise.com/v1/feeds/" + this.feedId + "?order=" + this.order + '&future=' + this.future.toString();
            var xhttp = null;
            xhttp = new XMLHttpRequest();
            if ("withCredentials" in xhttp) {
               // Firefox 3.5 and Safari 4
                xhttp.open("GET", url, true);
                xhttp.setRequestHeader("Api-Key", this.apiKey);
                xhttp.onreadystatechange = function() {
                  if (xhttp.readyState === 4 && xhttp.status === 200) {
                    self.data = JSON.parse(xhttp.responseText);
                    self.displayCurrent();
                  }
                };
                if (!this.debugLoading) {
                    xhttp.send();
                }
            } else {
                url = "https://api.affitise.com/v1/feeds/" + this.feedId + "/jsonp?order=" + this.order + '&future=' + this.future.toString() + '&apikey=' + this.apiKey + '&callback=' + this.callback;
                this.importScript(url);
            }
        } else {
            // Todo: iframe support?
        }
    };
};

Affitise.feed.prototype = {
    constructor: Affitise.feed,
    /**
     * Display your Affitise Discounts for a feed. The discounts will be
     * rotated automatically.
     * @public
     * @param {string} [size = MediumRectangle] - What size to display. Can be: "Leaderboard" [728x90], "MediumRectangle" [300x250], or "WideSkyscraper" [160x600]
     * @param {Object.<string, number>=} [options={ rotationSpeed: 5000, order: feed, displayElement: affitise-display }] Any additional options. Order can be: "feed", "expiration", or "created"
     */
    display: function(size, options) {
        if (size) {
            this.size = size;
        }
        if (!options) {
            options = {};
        }
        if (options.rotationSpeed) {
            this.rotationSpeed = options.rotationSpeed;
        }
        if (options.order) {
            this.order = options.order;
        }
        if (options.displayElement) {
            this.displayElement = options.displayElement;
        }
        
        this.load();
    },
    /**
     * Stop rotating discounts
     * @public
     */
    stop: function() {
        this.stopRotation();
    }
};
