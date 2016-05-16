/*jslint browser this for bitwise */
/*global alert $ Tool tools toolFactory URL WebSocket FileReader Blob*/

(function () {
    "use strict";
    var app = {
        catsPool: [],
        catsLoved: [],
        catsHated: [],
        catinderProfil: null,
        catinderPictureHolder: null,
        catinderInfosName: null,
        catinderInfosAge: null,
        loading: false,
        currentCat: null,
        geoloc: {
            enabled: false,
            coords: {}
        },

        initialize: function () {
            this.catinderProfil = document.querySelector(".catinder-profil");
            this.catinderPictureHolder = document.querySelector(".catinder-picture-holder");
            this.catinderInfosName = document.querySelector(".catinder-infos-name");
            this.catinderInfosAge = document.querySelector(".catinder-infos-age");

            this.loadFromStorage();
            this.enableGeoloc();
            this.bindEvents();
            this.getCats();
        },
        bindEvents: function () {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            document.addEventListener('offline', this.offline, false);
            document.addEventListener('online', this.online, false);
            document.querySelector(".catinder-like").addEventListener("touchstart", this.likeCat.bind(this));
            document.querySelector(".catinder-dislike").addEventListener("touchstart", this.dislikeCat.bind(this));
            this.startCatDoubleTap();
        getCats: function () {
            var self = this;
            var url = "http://catinder.samsung-campus.net/proxy.php";

            if (this.geoloc.enabled) {
                url = url + "?position=" + this.geoloc.coordinates.lat + "," + this.geoloc.coordinates.long;
            }
            $.ajax({
                url: url
            }).done(function (data) {
                var cats = JSON.parse(data).results;
                self.proceedCats(cats);
            });
        },
        proceedCats: function (cats) {
            var self = this;
            cats.forEach(function (cat) {
                if (self.isCatIn(cat, self.catsHated) === false && self.isCatIn(cat, self.catsLoved) === false) {
                    self.catsPool.push(cat);
                }
            });
            this.prepareOneCat();
        },
        isCatIn: function (cat, array) {
            var i;
            for (i = 0; i < array.length; i += 1) {
                if (array[i].sha1 === cat.sha1) {
                    return true;
                }
            }
            return false;
        },
        onDeviceReady: function () {
            this.receivedEvent('deviceready');
        prepareOneCat: function () {
            if (this.checkRemainingCats() === true) {
                this.currentCat = this.catsPool[0];
                this.catsPool.splice(0, 1);
                this.displayOneCat(this.currentCat);
            }
        },
        displayOneCat: function (cat) {
            var self = this;
            var img = new Image();
            img.src = cat.picUrl;
            img.onload = function () {
                if (self.catinderPictureHolder.children[0]) {
                    self.catinderPictureHolder.removeChild(self.catinderPictureHolder.firstChild);
                }
                img.className = "catinder-picture-img";
                self.catinderPictureHolder.appendChild(img);
                self.catinderInfosName.innerHTML = cat.name;
                self.catinderInfosAge.innerHTML = cat.age + " ans";

                self.loading = false;
            };
        },
        checkRemainingCats: function () {
            if (this.catsPool.length === 0) {
                this.getCats();
                return false;
            }
            return true;
        },
        offline: function () {
            alert('On est Offline !');
        likeCat: function () {
            if (this.loading === false) {
                this.loading = true;
                this.catinderPictureHolder.children[0].className += " liked";
                this.catsLoved.push(this.currentCat);
                this.saveToStorage();
                this.prepareOneCat();
            }
        },
        dislikeCat: function () {
            if (this.loading === false) {
                this.loading = true;
                this.catinderPictureHolder.children[0].className += " disliked";
                this.catsHated.push(this.currentCat);
                this.saveToStorage();
                this.prepareOneCat();
            }
        },
        enableGeoloc: function () {
            var self = this;
            navigator.geolocation.getCurrentPosition(function (data) {
                self.geoloc.enabled = true;
                self.geoloc.coordinates = {
                    lat: data.coords.latitude,
                    long: data.coords.longitude
                };
            });
        },
        online: function () {
            alert('On est Online !');
        startCatDoubleTap: function () {
            var self = this;
            var delays = [];
            var duration = 300;
            this.catinderPictureHolder.addEventListener("touchstart", function (event) {
                delays.push(event.timeStamp);
                if (delays.length === 2) {
                    if (delays[1] - delays[0] <= duration) {
                        self.likeCat();
                    }
                    delays.splice(0, 1);
                }
            });
        },
        loadFromStorage: function () {
            if (localStorage.getItem("catinder-loved") !== null) {
                this.catsLoved = JSON.parse(localStorage.getItem("catinder-loved"));
            }
            if (localStorage.getItem("catinder-hated") !== null) {
                this.catsHated = JSON.parse(localStorage.getItem("catinder-hated"));
            }
        },
        receivedEvent: function (id) {
            alert("Le device est pret");
        saveToStorage: function () {
            localStorage.setItem("catinder-loved", JSON.stringify(this.catsLoved));
            localStorage.setItem("catinder-hated", JSON.stringify(this.catsHated));
        }
    };
    app.initialize();
}());