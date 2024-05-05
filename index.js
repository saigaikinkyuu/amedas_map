var map;

function mapDraw(num) {
    map = L.map('map', {
        zoomControl: false,
        minZoom: 7, // 最低ズームレベルを4に設定
        maxZoom: 9 // 最大ズームレベルを7に設定
    });

    var initialLatLng = L.latLng("35.39", "139.44");
    map.setView(initialLatLng, 7);

    L.control.scale({
        maxWidth: 150,
        position: 'bottomright',
        imperial: false
    }).addTo(map);

    // GeoJSON データを読み込んで地図に追加
    $.getJSON("./prefectures.geojson", function (data) {
        L.geoJson(data, {
            style: {
                "color": "#ffffff",
                "weight": 1.5,
                "opacity": 1,
                "fillColor": "#3a3a3a",
                "fillOpacity": 1
            }
        }).addTo(map);
        
        var currentTime = new Date();
        var currentMin = ('0' + currentTime.getMinutes()).slice(-2);
        var currentHour = currentTime.getHours();
        var currentYear = currentTime.getFullYear();
        var currentMonth = ('0' + (currentTime.getMonth() + 1)).slice(-2);
        var currentDay = ('0' + currentTime.getDate()).slice(-2);
        var min = 0
        if(currentMin.slice(0,1) === 0 || currentMin.slice(1,2) <= 7){
            currentHour -= 1
            min = currentMin.slice(0,1)-1
            if(min < 0){
                min = 5
            }
            if(currentHour < 0){
                currentHour += 23
                currentDay -= 1
                if(currentDay <= 0){
                    currentMonth -= 1
                    currentDay = new Date(currentYear, currentMonth, 0).getDate();
                    if(currentMonth <= 0){
                        currentMonth += 12
                        currentYear -= 1
                    }
                }
            }
        }else {
            min = currentMin.slice(0,1)
        }

        // AMeDAS データを読み込み、円を追加
        $.getJSON("https://www.jma.go.jp/bosai/amedas/data/map/" + currentYear + currentMonth + ("0"+currentDay).slice(-2) + ("0" + currentHour).slice(-2) + "" + min + "000.json", function (datas) {
            $.getJSON("https://www.jma.go.jp/bosai/amedas/const/amedastable.json", function (data) {
                function formatDate(date) {
                    var year = date.getFullYear();
                    var month = ('0' + (date.getMonth() + 1)).slice(-2);
                    var day = ('0' + date.getDate()).slice(-2);
                    var hours = ('0' + date.getHours()).slice(-2);
                    var minutes = ('0' + date.getMinutes()).slice(-2);
                    var seconds = ('0' + date.getSeconds()).slice(-2);
                    return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds;
                }
                for (var key in datas) {
                    function dmsToDd(degrees, minutes, seconds, direction) {
                        var dd = degrees + minutes / 60 + seconds / (60 * 60);
                        if (direction == "S" || direction == "W") {
                            dd = dd * -1;
                        }
                        return dd;
                    }
                    var markerData = datas[key];
                    markerData.url = 'https://amedas.jkisyou.com/graph.html#' + key;

                    var latitude = dmsToDd(data[key].lat[0], (data[key].lat[1] + "0").slice(0, 2), (data[key].lat[1] + "0").slice(2), "N");
                    var longitude = dmsToDd(data[key].lon[0], (data[key].lon[1] + "0").slice(0, 2), (data[key].lon[1] + "0").slice(2), "E");

                    if (datas[key].temp && num === 1) {
                        if (datas[key].temp[0] <= -5) {
                            var color = "#969696"
                            var rgba = "rgba(150, 150, 150,0.3)"
                        } else if (datas[key].temp[0] <= 0) {
                            var color = "blue"
                            var rgba = "rgba(000,000,200,0.3)"
                        } else if (datas[key].temp[0] <= 5) {
                            var color = "#0096c8"
                            var rgba = "rgba(0, 150, 200,0.3)"
                        } else if (datas[key].temp[0] <= 10) {
                            var color = "#00c800"
                            var rgba = "rgba(0, 200, 0 ,0.3)"
                        } else if (datas[key].temp[0] <= 15) {
                            var color = "yellow"
                            var rgba = "rgba(255,255,0,0.3)"
                        } else if (datas[key].temp[0] <= 20) {
                            var color = "orange"
                            var rgba = "rgba(255,165,0,0.3)"
                        } else if (datas[key].temp[0] <= 25) {
                            var color = "red"
                            var rgba = "rgba(255,0,0,0.3)"
                        } else {
                            var color = "purple"
                            var rgba = "rgba(170,0,199,0.3)"
                        }
                        var markerL = new L.LatLng(latitude, longitude);
                        var marker = L.circleMarker(markerL, {
                            radius: 6,
                            color: color,
                            fillColor: rgba,
                            fillOpacity: 1
                        }).addTo(map);
                        // 地図にマーカーを追加
                        marker.bindPopup("<div style='text-align: center;'>"+data[key].kjName + "(" + data[key].knName + ")<br>" + datas[key].temp[0]+"℃</div>", {
                            closeButton: false,
                            zIndexOffset: 10000,
                            maxWidth: 10000
                        });
                        marker.on('mouseover', function (e) {
                            this.openPopup();
                        });
                        marker.on('mouseout', function (e) {
                            this.closePopup();
                        });
                        var url = "https://amedas.jkisyou.com/graph.html#" + key + "" + 1
                        // マーカーをクリックした際の処理
                        marker.on('click', (function(url) {
                            return function(e) {
                                document.getElementById("chart").style.display = "block"
                                document.getElementById("site_chart").src = url
                            };
                        })(url));
                    }else if(datas[key].humidity && num === 2){
                        if (datas[key].humidity[0] <= 10) {
                            var color = "#785046"
                            var rgba = "rgba(120, 80, 70,0.3)"
                        } else if (datas[key].humidity[0] <= 20) {
                            var color = "#966450"
                            var rgba = "rgba(150, 100, 80,0.3)"
                        } else if (datas[key].humidity[0] <= 30) {
                            var color = "orange"
                            var rgba = "rgba(255,165,0,0.3)"
                        } else if (datas[key].humidity[0] <= 40) {
                            var color = "yellow"
                            var rgba = "rgba(255,255,0,0.3)"
                        } else if (datas[key].humidity[0] <= 50) {
                            var color = "#c8ff00"
                            var rgba = "rgba(200, 255, 0,0.3)"
                        } else if (datas[key].humidity[0] <= 60) {
                            var color = "#00ff00"
                            var rgba = "rgba(0, 255, 0,0.3)"
                        } else if (datas[key].humidity[0] <= 70) {
                            var color = "#00aa00"
                            var rgba = "rgba(0,170,0,0.3)"
                        } else if (datas[key].humidity[0] <= 80) {
                            var color = "#0096c8"
                            var rgba = "rgba(0, 150, 200,0.3)"
                        } else if (datas[key].humidity[0] <= 90) {
                            var color = "blue"
                            var rgba = "rgba(000,000,200,0.3)"
                        } else {
                            //ここまで作業終了「10%」まで色を変更する
                            var color = "purple"
                            var rgba = "rgba(170,0,199,0.3)"
                        }
                        var markerL = new L.LatLng(latitude, longitude);
                        var marker = L.circleMarker(markerL, {
                            radius: 6,
                            color: color,
                            fillColor: rgba,
                            fillOpacity: 1
                        }).addTo(map);
                        // 地図にマーカーを追加
                        marker.bindPopup("<div style='text-align: center;'>"+data[key].kjName + "(" + data[key].knName + ")<br>" + datas[key].humidity[0]+"%</div>", {
                            closeButton: false,
                            zIndexOffset: 10000,
                            maxWidth: 10000
                        });
                        marker.on('mouseover', function (e) {
                            this.openPopup();
                        });
                        marker.on('mouseout', function (e) {
                            this.closePopup();
                        });
                        var url = "https://amedas.jkisyou.com/graph.html#" + key + "" + 2
                        // マーカーをクリックした際の処理
                        marker.on('click', (function(url) {
                            return function(e) {
                                document.getElementById("chart").style.display = "block"
                                document.getElementById("site_chart").src = url
                            };
                        })(url));
                    }else if(datas[key].precipitation1h && num === 3){
                        if (datas[key].precipitation1h[0] <= 0.1) {
                            var color = "#785046"
                            var rgba = "rgba(120, 80, 70,0.3)"
                        } else if (datas[key].precipitation1h[0] <= 0.5) {
                            var color = "#966450"
                            var rgba = "rgba(150, 100, 80,0.3)"
                        } else if (datas[key].precipitation1h[0] <= 1) {
                            var color = "orange"
                            var rgba = "rgba(255,165,0,0.3)"
                        } else if (datas[key].precipitation1h[0] <= 5) {
                            var color = "yellow"
                            var rgba = "rgba(255,255,0,0.3)"
                        } else if (datas[key].precipitation1h[0] <= 10) {
                            var color = "#c8ff00"
                            var rgba = "rgba(200, 255, 0,0.3)"
                        } else if (datas[key].precipitation1h[0] <= 20) {
                            var color = "#00ff00"
                            var rgba = "rgba(0, 255, 0,0.3)"
                        } else if (datas[key].precipitation1h[0] <= 30) {
                            var color = "#00aa00"
                            var rgba = "rgba(0,170,0,0.3)"
                        } else if (datas[key].precipitation1h[0] <= 50) {
                            var color = "#0096c8"
                            var rgba = "rgba(0, 150, 200,0.3)"
                        } else if (datas[key].precipitation1h[0] <= 100) {
                            var color = "blue"
                            var rgba = "rgba(000,000,200,0.3)"
                        } else {
                            //ここまで作業終了「10%」まで色を変更する
                            var color = "purple"
                            var rgba = "rgba(170,0,199,0.3)"
                        }
                        var markerL = new L.LatLng(latitude, longitude);
                        var marker = L.circleMarker(markerL, {
                            radius: 6,
                            color: color,
                            fillColor: rgba,
                            fillOpacity: 1
                        }).addTo(map);
                        // 地図にマーカーを追加
                        marker.bindPopup("<div style='text-align: center;'>"+data[key].kjName + "(" + data[key].knName + ")<br>" + datas[key].precipitation1h[0]+"mm</div>", {
                            closeButton: false,
                            zIndexOffset: 10000,
                            maxWidth: 10000
                        });
                        marker.on('mouseover', function (e) {
                            this.openPopup();
                        });
                        marker.on('mouseout', function (e) {
                            this.closePopup();
                        });
                        var url = "https://amedas.jkisyou.com/graph.html#" + key + "" + 3
                        // マーカーをクリックした際の処理
                        marker.on('click', (function(url) {
                            return function(e) {
                                document.getElementById("chart").style.display = "block"
                                document.getElementById("site_chart").src = url
                            };
                        })(url));
                    }else if (datas[key].temp && num === 4) {
                        //ここまで作業終了
                        if (datas[key].temp[0] <= Number((document.getElementById("inputHanrei1_7").value).substr(0, (document.getElementById("inputHanrei1_7").value).indexOf('〜')))) {
                            var color = "#969696"
                            var rgba = "rgba(150, 150, 150,0.3)"
                        } else if (datas[key].temp[0] <= Number((document.getElementById("inputHanrei1_6").value).substr(0, (document.getElementById("inputHanrei1_6").value).indexOf('〜')))) {
                            var color = "blue"
                            var rgba = "rgba(000,000,200,0.3)"
                        } else if (datas[key].temp[0] <= Number((document.getElementById("inputHanrei1_5").value).substr(0, (document.getElementById("inputHanrei1_5").value).indexOf('〜')))) {
                            var color = "#0096c8"
                            var rgba = "rgba(0, 150, 200,0.3)"
                        } else if (datas[key].temp[0] <= Number((document.getElementById("inputHanrei1_4").value).substr(0, (document.getElementById("inputHanrei1_4").value).indexOf('〜')))) {
                            var color = "#00c800"
                            var rgba = "rgba(0, 200, 0 ,0.3)"
                        } else if (datas[key].temp[0] <= Number((document.getElementById("inputHanrei1_3").value).substr(0, (document.getElementById("inputHanrei1_3").value).indexOf('〜')))) {
                            var color = "yellow"
                            var rgba = "rgba(255,255,0,0.3)"
                        } else if (datas[key].temp[0] <= Number((document.getElementById("inputHanrei1_2").value).substr(0, (document.getElementById("inputHanrei1_2").value).indexOf('〜')))) {
                            var color = "orange"
                            var rgba = "rgba(255,165,0,0.3)"
                        } else if (datas[key].temp[0] <= Number((document.getElementById("inputHanrei1_1").value).substr(0, (document.getElementById("inputHanrei1_1").value).indexOf('〜')))) {
                            var color = "red"
                            var rgba = "rgba(255,0,0,0.3)"
                        } else {
                            var color = "purple"
                            var rgba = "rgba(170,0,199,0.3)"
                        }
                        document.getElementById("inputHanrei1_8").value = "〜" + (document.getElementById("inputHanrei1_7").value).substr(0, (document.getElementById("inputHanrei1_7").value).indexOf('〜'))
                        var markerL = new L.LatLng(latitude, longitude);
                        var marker = L.circleMarker(markerL, {
                            radius: 6,
                            color: color,
                            fillColor: rgba,
                            fillOpacity: 1
                        }).addTo(map);
                        // 地図にマーカーを追加
                        marker.bindPopup("<div style='text-align: center;'>"+data[key].kjName + "(" + data[key].knName + ")<br>" + datas[key].temp[0]+"℃</div>", {
                            closeButton: false,
                            zIndexOffset: 10000,
                            maxWidth: 10000
                        });
                        marker.on('mouseover', function (e) {
                            this.openPopup();
                        });
                        marker.on('mouseout', function (e) {
                            this.closePopup();
                        });
                        var url = "https://amedas.jkisyou.com/graph.html#" + key + "" + 1
                        // マーカーをクリックした際の処理
                        marker.on('click', (function(url) {
                            return function(e) {
                                document.getElementById("chart").style.display = "block"
                                document.getElementById("site_chart").src = url
                            };
                        })(url));
                    }
                }
            });
        });
    });
}

function changeMap(i) {
    console.log("C,"+i)
    map.remove();
    mapDraw(i);
}

function start() {
    mapDraw(1);
}

start();
